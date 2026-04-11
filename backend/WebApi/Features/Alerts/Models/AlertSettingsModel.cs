namespace WebApi.Features.Alerts.Models;

public class AlertSettingsModel
{
    public bool IsOrderAlertsEnabled { get; set; } = true;
    public bool IsPointChangeAlertsEnabled { get; set; } = true;
}