namespace WebApi.Data.Entities;

public class OrderAlert
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public DriverUser Driver { get; set; } = null!;
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
}