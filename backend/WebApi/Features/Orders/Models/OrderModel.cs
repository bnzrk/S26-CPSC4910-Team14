using WebApi.Data.Enums;

namespace WebApi.Features.Orders.Models;

public class OrderModel
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public int SponsorOrgId { get; set; }
    public ICollection<OrderItemModel> Items { get; set; } = new List<OrderItemModel>();
    public OrderStatus Status { get; set; }
    public DateTime PlacedDateUtc;
    public DateTime? ShippeDateUtc;
    public DateTime? DeliveryStartDateUtc;
    public DateTime? DeliveryCompleteDateUtc;
    public DateTime? CanceledDateUtc;
}