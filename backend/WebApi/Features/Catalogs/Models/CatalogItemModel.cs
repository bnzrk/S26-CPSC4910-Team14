namespace WebApi.Features.Catalogs.Models;

public class CatalogItemModel
{
    public int Id { get; set; }
    public int ExternalId { get; set; }
    public int CatalogId { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string Description { get; set; }
    public decimal ExternalPrice { get; set; }
    public decimal Price { get; set; }
    public List<string> Images { get; set; } = new List<string>();
}