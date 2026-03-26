using Microsoft.EntityFrameworkCore;

namespace WebApi.Data.Entities;

public class SponsorOrg
{
    public int Id { get; set; }
    public required string SponsorName { get; set; }
    public DateTime DateJoined { get; set; }
    public ICollection<SponsorUser> SponsorUsers { get; set; } = new List<SponsorUser>();
    public ICollection<DriverUser> DriverUsers { get; set; } = new List<DriverUser>();
    public ICollection<PointRule> PointRules { get; set; } = new List<PointRule>();
    [Precision(18, 4)]
    public decimal PointRatio { get; set; } = 0.01m;
    public Catalog Catalog { get; set; } = null!;
}