using WebApi.Data.Enums;

public class DriverSponsorChangeAuditLog
{
    public int Id { get; set; }
    public required DateTime TimestampUtc { get; set; }
    public required int DriverId { get; set; }
    public required int SponsorOrgId { get; set; }
    public required DriverSponsorChangeType ChangeType { get; set; }
}