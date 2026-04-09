using WebApi.Data.Enums;

namespace WebApi.Features.Alerts.Models;

public class SponsorshipChangeAlertMetadata
{
    public required string SponsorName { get; set; }
    public DriverSponsorChangeType ChangeType { get; set; }
}