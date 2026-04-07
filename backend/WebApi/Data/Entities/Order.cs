using WebApi.Data.Enums;

namespace WebApi.Data.Entities;

public class Order
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public DriverUser Driver { get; set; } = null!;
    public int SponsorOrgId { get; set; }
    public SponsorOrg SponsorOrg { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public OrderStatus Status { get; set; } = OrderStatus.Placed;
    public DateTime PlacedDateUtc { get; set; }
    public DateTime? ShippeDateUtc { get; set; }
    public DateTime? DeliveryStartDateUtc { get; set; }
    public DateTime? DeliveryCompleteDateUtc { get; set; }
    public DateTime? CanceledDateUtc { get; set; }
    public bool IsRefunded { get; set; } = false;
}