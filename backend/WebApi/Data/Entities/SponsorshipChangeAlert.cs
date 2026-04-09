using WebApi.Data.Enums;

namespace WebApi.Data.Entities;

public class SponsorshipChangeAlert
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public DriverUser Driver { get; set; } = null!;
    public int SponsorOrgId { get; set; }
    public SponsorOrg SponsorOrg { get; set; } = null!;
    public DriverSponsorChangeType ChangeType { get; set; }
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
}