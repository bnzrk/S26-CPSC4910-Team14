namespace WebApi.Data.Entities.Audit;

public class CatalogChangeAuditLog
{
    public int Id { get; set; }
    public required DateTime TimestampUtc { get; set; }
    public required string ActorUserId { get; set; }
    public required string ActorUserEmail { get; set; }
    public required int SponsorOrgId { get; set; }
    public required string ChangeType { get; set; }
    public required int ExternalItemId { get; set; }
}
