namespace WebApi.Data.Entities;

public class DriverAlertSettings
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public DriverUser Driver { get; set; } = null!;
    public bool IsOrderAlertsEnabled { get; set; } = true;
    public bool IsPointChangeAlertsEnabled { get; set; } = true;
}