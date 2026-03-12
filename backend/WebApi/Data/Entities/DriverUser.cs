using System.ComponentModel.DataAnnotations.Schema;

namespace WebApi.Data.Entities;

public class DriverUser
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    public ICollection<SponsorOrg> SponsorOrgs { get; set; } = new List<SponsorOrg>();
    public ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
}