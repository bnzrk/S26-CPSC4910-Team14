namespace WebApi.Features.SponsorOrgs.Models;

public class PointRuleModel
{
    public required int Id { get; set; }
    public required int SponsorOrgId { get; set; }
    public required string Reason { get; set; }
    public required int BalanceChange { get; set; }
}