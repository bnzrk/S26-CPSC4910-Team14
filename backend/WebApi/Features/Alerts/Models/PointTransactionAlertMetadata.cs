namespace WebApi.Features.Alerts.Models;

public class PointTransactionAlertMetadata
{
    public required string SponsorName { get; set; }
    public required int BalanceChange { get; set; }
    public required string Reason { get; set; }
}