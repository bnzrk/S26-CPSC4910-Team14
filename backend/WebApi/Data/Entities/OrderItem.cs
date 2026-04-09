namespace WebApi.Data.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;
    public required string ThumbnailUrl { get; set; }
    public required string Title { get; set; }
    public required string Category { get; set; }
    public required string Description { get; set; }
    public int PricePoints { get; set; }
    public decimal PriceUsd { get; set; }
    public decimal VendorPriceUsd { get; set; }
}