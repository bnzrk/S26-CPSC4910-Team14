using WebApi.Features.SponsorOrgs;

namespace WebApi.Data.Entities;

public class DriverUser
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<SponsorOrg> SponsorOrgs { get; set; } = new List<SponsorOrg>();
    public ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<PointTransactionAlert> PointTransactionAlerts { get; set; } = new List<PointTransactionAlert>();
    public ICollection<SponsorshipChangeAlert> SponsorshipChangeAlerts { get; set; } = new List<SponsorshipChangeAlert>();
}