namespace WebApi.Data.Entities;

public class SponsorOrg
{
    public int Id { get; set; }
    public required string SponsorName { get; set; }
    public DateTime DateJoined { get; set; }
    public ICollection<SponsorUser> SponsorUsers { get; set; } = new List<SponsorUser>();
    public ICollection<DriverUser> DriverUsers { get; set; } = new List<DriverUser>();
    public ICollection<PointRule> PointRules { get; set; } = new List<PointRule>();
}