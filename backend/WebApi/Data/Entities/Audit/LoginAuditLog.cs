namespace WebApi.Data.Entities.Audit;

public class LoginAuditLog
{
    public int Id { get; set; }
    public string? UserId { get; set;} // Set if login successfull
    public required DateTime TimestampUtc { get; set; }
    public required string Email { get; set; }
    public required bool Successful { get; set; }
}