namespace WebApi.Data.Entities;

public class PointRule
{
    public int Id { get; set; }
    public int SponsorOrgId { get; set; }
    public SponsorOrg SponsorOrg { get; set; } = null!;
    public required string Reason { get; set; }
    public int BalanceChange { get; set; }
}