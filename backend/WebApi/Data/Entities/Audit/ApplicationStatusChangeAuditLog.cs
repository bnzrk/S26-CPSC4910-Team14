namespace WebApi.Data.Entities.Audit;

public class ApplicationStatusChangeAuditLog
{
    public int Id { get; set; }
    public required DateTime TimestampUtc { get; set; }
    public required string ActorUserId { get; set; }
    public required string ActorUserEmail { get; set; }
    public required int ApplicationId { get; set; }
    public required string NewStatus { get; set; }
    public string? RejectionReason { get; set; }
}