using WebApi.Data.Enums;

namespace WebApi.Features.Orders.Models;

public class CreateOrderResultModel
{
    public int? OrderId { get; set; }
    public required bool Successful { get; set; }
    public OrderErrorType? ErrorType { get; set; }
    public string? Error { get; set; }
}