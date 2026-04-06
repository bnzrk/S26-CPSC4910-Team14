using WebApi.Data.Enums;

namespace WebApi.Features.Orders.Models;

public class CreateOrderModel
{
    public required int DriverId { get; set; }
    public required int CatalogId { get; set; }
    public required List<int> CatalogItemIds { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Placed;
}