namespace LexSample.Steeltoe;

public sealed class LexOptions
{
    public string SenderId   { get; set; } = "SAMPLE-DOTNET-001";
    public string ReceiverId { get; set; } = "LEX-PLATFORM";
    public string ApiBase    { get; set; } = "https://sandbox.lexstandard.org/v1";
    public string ApiKey     { get; set; } = string.Empty;
}
