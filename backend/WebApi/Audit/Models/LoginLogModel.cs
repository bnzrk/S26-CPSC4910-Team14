namespace WebApi.Audit.Models;

public class LoginLogModel
{
    public required DateTime TimestampUtc { get; set; }
    public required string Email { get; set; }
    public required bool Successful { get; set; }
}