using WebApi.Data.Enums;

namespace WebApi.Features.Orders.Models;

public class CreateOrderModel
{
    public int? DriverId { get; set; }
    public int CatalogId { get; set; }
    public required List<int> CatalogItemIds { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Placed;
}