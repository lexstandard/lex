using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using LexStandard;
using LexStandard.DSL;
using LexSample.Steeltoe;
using Microsoft.Extensions.Options;
using Steeltoe.Management.Endpoint;

// ── Builder ───────────────────────────────────────────────────────────────
var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<LexOptions>(builder.Configuration.GetSection("Lex"));
builder.Services.AddHttpClient("lex");
builder.AddAllActuators();          // Steeltoe: /actuator/health, /actuator/info, etc.

var app = builder.Build();

app.MapAllActuators();

// ── Industry registry ─────────────────────────────────────────────────────
var examplesDir = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../examples"));

var industries = new Dictionary<string, (AssetClass AssetClass, string ScenarioFile)>
{
    ["automotive"]      = (AssetClass.Vehicle,        "automotive/json/automotive_e2e_scenario.json"),
    ["aviation"]        = (AssetClass.Aviation,        "aviation/json/aviation_e2e_scenario.json"),
    ["maritime"]        = (AssetClass.Maritime,        "maritime/json/maritime_e2e_scenario.json"),
    ["heavy-equipment"] = (AssetClass.HeavyEquipment,  "heavy-equipment/json/heavy_equipment_e2e_scenario.json"),
    ["real-estate"]     = (AssetClass.GeneralGoods,    "real-estate/json/real_estate_e2e_scenario.json"),
    ["technology"]      = (AssetClass.Technology,      "technology/json/technology_e2e_scenario.json"),
};

static JsonObject? FirstLead(JsonDocument doc)
{
    foreach (var msg in doc.RootElement.GetProperty("messages").EnumerateArray())
    {
        if (msg.TryGetProperty("lex", out var lex) &&
            lex.TryGetProperty("payload", out var payload) &&
            payload.TryGetProperty("lead", out var lead))
        {
            return JsonNode.Parse(lead.GetRawText())!.AsObject();
        }
    }
    return null;
}

static string? Str(JsonObject? obj, string key) =>
    obj?.TryGetPropertyValue(key, out var v) == true ? v?.GetValue<string>() : null;

// ── GET /industries ───────────────────────────────────────────────────────
app.MapGet("/industries", () => Results.Ok(new { industries = industries.Keys }));

// ── GET /examples/{industry} ──────────────────────────────────────────────
app.MapGet("/examples/{industry}", (string industry) =>
{
    if (!industries.TryGetValue(industry, out var meta))
        return Results.NotFound(new { error = $"Unknown industry: {industry}" });

    var path    = Path.Combine(examplesDir, meta.ScenarioFile);
    var content = File.ReadAllText(path);
    return Results.Content(content, "application/json");
});

// ── POST /leads/{industry} ────────────────────────────────────────────────
app.MapPost("/leads/{industry}", async (
    string industry,
    JsonObject? body,
    IOptions<LexOptions> opts,
    IHttpClientFactory httpFactory) =>
{
    if (!industries.TryGetValue(industry, out var meta))
        return Results.NotFound(new { error = $"Unknown industry: {industry}" });

    var o        = opts.Value;
    var path     = Path.Combine(examplesDir, meta.ScenarioFile);
    using var doc = JsonDocument.Parse(File.ReadAllText(path));

    var sourceLead = FirstLead(doc);
    if (sourceLead is null)
        return Results.Problem("No LEAD message found in scenario");

    var customer = sourceLead["customer"]?.AsObject();
    var product  = (sourceLead["desiredProduct"] ?? sourceLead["desiredAsset"])?.AsObject();

    string? Get(string key) => body?[key]?.GetValue<string>() ?? Str(customer, key[0..1].ToLower() + key[1..]);

    // Build via DSL
    var message = new LexLeadBuilder()
        .WithSender(o.SenderId)
        .WithReceiver(o.ReceiverId)
        .WithLeadStatus(LeadStatus.ExpressedInterest)
        .WithCustomer(new LexCustomer(
            FirstName: Get("firstName"),
            LastName:  Get("lastName"),
            Email:     Get("email"),
            Phone:     Get("phone")))
        .WithDesiredAsset(new LexAssetSpec(
            AssetClass:  meta.AssetClass,
            ProductType: Enum.TryParse<ProductType>(Str(product, "productType"), out var pt) ? pt : ProductType.Vehicle,
            Year:        product?["year"]?.GetValue<int>()))
        .Build();

    // Validate locally
    var validation = LexClient.Validate(message);
    if (!validation.Valid)
        return Results.UnprocessableEntity(new { stage = "validation", valid = false, errors = validation.Errors });

    // Submit to LEX API
    var httpClient = httpFactory.CreateClient("lex");
    if (!string.IsNullOrEmpty(o.ApiKey))
        httpClient.DefaultRequestHeaders.Authorization = new("Bearer", o.ApiKey);

    var content  = new StringContent(message.ToJsonString(), Encoding.UTF8, "application/json");
    var response = await httpClient.PostAsync($"{o.ApiBase}/messages", content);
    var apiBody  = await response.Content.ReadAsStringAsync();

    var msgId    = message["lex"]!["header"]!["messageId"]!.GetValue<string>();
    var title    = doc.RootElement.TryGetProperty("_metadata", out var m)
                 ? m.GetProperty("title").GetString() : "";

    return Results.Ok(new
    {
        industry,
        scenario    = title,
        messageId   = msgId,
        valid       = true,
        apiResponse = JsonDocument.Parse(apiBody).RootElement,
    });
});

// ── POST /validate ────────────────────────────────────────────────────────
app.MapPost("/validate", (JsonObject body) =>
{
    var result = LexClient.Validate(body);
    return result.Valid
        ? Results.Ok(new { valid = true, errors = result.Errors })
        : Results.UnprocessableEntity(new { valid = false, errors = result.Errors });
});

app.Run();
