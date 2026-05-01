package org.lexstandard.samples;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import org.lexstandard.Lex;
import org.lexstandard.LexTypes.*;
import org.lexstandard.LexEnums.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * LEX Sample — Spring Boot REST Controller
 *
 * Routes:
 *   GET  /industries            — list supported industries
 *   GET  /examples/{industry}   — raw e2e scenario JSON
 *   POST /leads/{industry}      — build + validate + submit a lead
 *   POST /validate              — validate any raw LEX message body
 */
@RestController
public class LexController {

    private static final Gson GSON = new Gson();

    // Resolve examples/ relative to the project root (4 levels up from target/classes)
    private static final Path EXAMPLES_DIR = Path.of(
        LexController.class.getProtectionDomain().getCodeSource().getLocation().getPath()
    ).resolve("../../../../examples").normalize();

    private static final Map<String, IndustryMeta> INDUSTRIES = Map.of(
        "automotive",      new IndustryMeta(AssetClass.VEHICLE,         "automotive/json/automotive_e2e_scenario.json"),
        "aviation",        new IndustryMeta(AssetClass.AVIATION,        "aviation/json/aviation_e2e_scenario.json"),
        "maritime",        new IndustryMeta(AssetClass.MARITIME,        "maritime/json/maritime_e2e_scenario.json"),
        "heavy-equipment", new IndustryMeta(AssetClass.HEAVY_EQUIPMENT, "heavy-equipment/json/heavy_equipment_e2e_scenario.json"),
        "real-estate",     new IndustryMeta(AssetClass.GENERAL_GOODS,   "real-estate/json/real_estate_e2e_scenario.json"),
        "technology",      new IndustryMeta(AssetClass.TECHNOLOGY,      "technology/json/technology_e2e_scenario.json")
    );

    private final LexProperties props;
    private final RestTemplate  http = new RestTemplate();

    public LexController(LexProperties props) {
        this.props = props;
    }

    // ── GET /industries ───────────────────────────────────────────────────
    @GetMapping("/industries")
    public Map<String, Object> listIndustries() {
        return Map.of("industries", INDUSTRIES.keySet());
    }

    // ── GET /examples/{industry} ──────────────────────────────────────────
    @GetMapping("/examples/{industry}")
    public ResponseEntity<Object> getExample(@PathVariable String industry) throws IOException {
        if (!INDUSTRIES.containsKey(industry)) {
            return ResponseEntity.status(404).body(Map.of("error", "Unknown industry: " + industry));
        }
        String content = Files.readString(EXAMPLES_DIR.resolve(INDUSTRIES.get(industry).scenarioFile()), java.nio.charset.StandardCharsets.UTF_8).stripLeading().replaceFirst("\\uFEFF", "");
        return ResponseEntity.ok(GSON.fromJson(content, Object.class));
    }

    // ── POST /leads/{industry} ────────────────────────────────────────────
    @PostMapping("/leads/{industry}")
    public ResponseEntity<Object> submitLead(
            @PathVariable String industry,
            @RequestBody(required = false) Map<String, String> body) throws IOException {

        if (!INDUSTRIES.containsKey(industry)) {
            return ResponseEntity.status(404).body(Map.of("error", "Unknown industry: " + industry));
        }
        if (body == null) body = Map.of();

        IndustryMeta meta     = INDUSTRIES.get(industry);
        String       raw      = Files.readString(EXAMPLES_DIR.resolve(meta.scenarioFile()), java.nio.charset.StandardCharsets.UTF_8).replaceFirst("\\uFEFF", "");
        JsonObject   scenario = GSON.fromJson(raw, JsonObject.class);

        // Extract first LEAD from scenario
        JsonObject sourceLead = firstLead(scenario);
        JsonObject customer   = sourceLead.has("customer")     ? sourceLead.getAsJsonObject("customer")     : new JsonObject();
        JsonObject product    = sourceLead.has("desiredProduct") ? sourceLead.getAsJsonObject("desiredProduct")
                             : sourceLead.has("desiredAsset")  ? sourceLead.getAsJsonObject("desiredAsset") : new JsonObject();

        // Build via DSL
        JsonObject message = Lex.newLead()
            .sender(props.getSenderId())
            .receiver(props.getReceiverId())
            .leadStatus(LeadStatus.EXPRESSED_INTEREST)
            .customer(new LexCustomer(
                body.getOrDefault("firstName", str(customer, "firstName")),
                body.getOrDefault("lastName",  str(customer, "lastName")),
                body.getOrDefault("email",     str(customer, "email")),
                body.getOrDefault("phone",     str(customer, "phone"))
            ))
            .desiredAsset(new LexAssetSpec(
                meta.assetClass(),
                safeProductType(str(product, "productType", null)),
                product.has("year") ? product.get("year").getAsInt() : null
            ))
            .build();

        // Validate locally
        var validation = Lex.validate(message);
        if (!validation.valid()) {
            return ResponseEntity.unprocessableEntity().body(Map.of(
                "stage",  "validation",
                "valid",  false,
                "errors", validation.errors()
            ));
        }

        // Submit to LEX API
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (!props.getApiKey().isBlank()) {
            headers.setBearerAuth(props.getApiKey());
        }
        ResponseEntity<Object> apiResp = http.postForEntity(
            props.getApiBase() + "/messages",
            new HttpEntity<>(GSON.toJson(message), headers),
            Object.class
        );

        String msgId    = message.getAsJsonObject("lex").getAsJsonObject("header").get("messageId").getAsString();
        String scenario_title = scenario.has("_metadata")
            ? scenario.getAsJsonObject("_metadata").get("title").getAsString() : "";

        return ResponseEntity.ok(Map.of(
            "industry",    industry,
            "scenario",    scenario_title,
            "messageId",   msgId,
            "valid",       true,
            "apiResponse", apiResp.getBody()
        ));
    }

    // ── POST /validate ────────────────────────────────────────────────────
    @PostMapping("/validate")
    public ResponseEntity<Object> validate(@RequestBody String body) {
        JsonObject msg    = GSON.fromJson(body, JsonObject.class);
        var        result = Lex.validate(msg);
        return ResponseEntity
            .status(result.valid() ? 200 : 422)
            .body(Map.of("valid", result.valid(), "errors", result.errors()));
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    private record IndustryMeta(AssetClass assetClass, String scenarioFile) {}

    private static JsonObject firstLead(JsonObject scenario) {
        for (var el : scenario.getAsJsonArray("messages")) {
            var msg = el.getAsJsonObject();
            if (msg.has("lex")) {
                var payload = msg.getAsJsonObject("lex").getAsJsonObject("payload");
                if (payload.has("lead")) return payload.getAsJsonObject("lead");
            }
        }
        throw new IllegalStateException("No LEAD message found in scenario");
    }

    private static String str(JsonObject obj, String key) {
        return str(obj, key, null);
    }

    private static String str(JsonObject obj, String key, String fallback) {
        return obj != null && obj.has(key) && !obj.get(key).isJsonNull()
            ? obj.get(key).getAsString() : fallback;
    }

    private static ProductType safeProductType(String raw) {
        if (raw == null) return ProductType.VEHICLE;
        try {
            return ProductType.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ProductType.VEHICLE;
        }
    }
}
