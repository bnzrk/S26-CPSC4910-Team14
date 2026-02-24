namespace WebApi.Data.Entities;

public class PointTransaction
{
    public int Id { get; set; }
    public int SponsorOrgId { get; set; }
    public SponsorOrg SponsorOrg { get; set; } = null!;
    public int DriverUserId { get; set; }
    public DriverUser DriverUser { get; set; } = null!;
    public required int BalanceChange { get; set; }
    public required string Reason { get; set; }
    public DateTime TransactionDateUtc { get; set; }
}