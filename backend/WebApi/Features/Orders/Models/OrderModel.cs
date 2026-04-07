using WebApi.Data.Enums;

namespace WebApi.Features.Orders.Models;

public class OrderModel
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public int SponsorOrgId { get; set; }
    public ICollection<OrderItemModel> Items { get; set; } = new List<OrderItemModel>();
    public OrderStatus Status { get; set; }
    public DateTime PlacedDateUtc { get; set; }
    public DateTime? ShippeDateUtc { get; set; }
    public DateTime? DeliveryStartDateUtc { get; set; }
    public DateTime? DeliveryCompleteDateUtc { get; set; }
    public DateTime? CanceledDateUtc { get; set; }
    public bool IsRefunded { get; set; }
}