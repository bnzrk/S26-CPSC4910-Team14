using WebApi.Data.Enums;

namespace WebApi.Data.Entities.Audit;

public class PasswordChangeAuditLog
{
    public int Id { get; set; }
    public required DateTime TimestampUtc { get; set; }
    public required string UserId { get; set; }
    public required string Email { get; set; }
    public required PasswordChangeType ChangeType { get; set; }
    public required bool Successful { get; set; }
}