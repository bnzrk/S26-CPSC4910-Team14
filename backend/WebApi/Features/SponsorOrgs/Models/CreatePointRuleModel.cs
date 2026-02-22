namespace WebApi.Features.SponsorOrgs.Models;

public class CreatePointRulesModel
{
    public required string Reason { get; set; }
    public int BalanceChange { get; set; }
}