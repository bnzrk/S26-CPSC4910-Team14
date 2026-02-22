namespace WebApi.Data.Entities;

public class DriverUser
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    public int? SponsorOrgId { get; set; }
    public SponsorOrg? SponsorOrg { get; set; }
    public ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
}