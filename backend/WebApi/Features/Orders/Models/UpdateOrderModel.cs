using WebApi.Data.Enums;

namespace WebApi.Features.Orders.Models;

public class UpdateOrderStatusModel
{
    public required OrderStatus Status { get; set; }
}