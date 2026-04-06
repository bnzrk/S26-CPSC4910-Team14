using WebApi.Data.Enums;

namespace WebApi.Data.Entities;

public class Order
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public DriverUser Driver { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public OrderStatus Status { get; set; } = OrderStatus.Placed;
    public DateTime PlacedDateUtc;
    public DateTime? ShippeDateUtc;
    public DateTime? DeliveryStartDateUtc;
    public DateTime? DeliveryCompleteDateUtc;
    public DateTime? CanceledDateUtc;
}