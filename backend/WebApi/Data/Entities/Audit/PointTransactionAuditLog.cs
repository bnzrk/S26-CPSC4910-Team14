namespace WebApi.Data.Entities.Audit;

public class PointTransactionAuditLog
{
    public int Id { get; set; }
    public required DateTime TimestampUtc { get; set; }
    public required string ActorUserId { get; set; }
    public required string ActorUserEmail { get; set; }
    public required int DriverId { get; set; }
    public required string DriverEmail { get; set; }
    public required int SponsorOrgId { get; set; }
    public required string SponsorOrgName { get; set; }
    public required int BalanceChange { get; set; }
    public required string Reason { get; set; }
}