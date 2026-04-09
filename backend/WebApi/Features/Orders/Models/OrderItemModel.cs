namespace WebApi.Features.Orders.Models;

public class OrderItemModel
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public required string ThumbnailUrl { get; set; }
    public required string Title { get; set; }
    public required string Category { get; set; }
    public required string Description { get; set; }
    public int PricePoints { get; set; }
    public decimal PriceUsd { get; set; }
    public decimal VendorPriceUsd { get; set; }
}