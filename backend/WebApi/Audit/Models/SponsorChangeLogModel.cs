using WebApi.Data.Enums;

namespace WebApi.Audit.Models;

public class SponsorChangeLogModel
{
    public int Id { get; set; }
    public required DateTime TimestampUtc { get; set; }
    public required string ActorUserEmail { get; set; }
    public required string DriverEmail { get; set; }
    public required string SponsorOrgName { get; set; }
    public required string ChangeType { get; set; }
}