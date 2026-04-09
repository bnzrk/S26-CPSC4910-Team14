namespace WebApi.Features.BulkActions;

public record LineResult(int Line, string[] Tokens, string? Error = null);