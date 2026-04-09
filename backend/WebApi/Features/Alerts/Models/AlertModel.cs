using WebApi.Data.Enums;

namespace WebApi.Features.Alerts.Models;

public class AlertModel
{
    public required int Id { get; set; }
    public required AlertType Type { get; set;} 
    public required DateTime TimestampUtc { get; set; }= DateTime.UtcNow;
    public object? Metadata { get; set; }
}