namespace WebApi.Features.Alerts.Models;

public class OrderAlertMetadata
{
    public required int OrderId { get; set; }
    public required string ItemSummary { get; set; }
    public required int PointTotal { get; set; }
}