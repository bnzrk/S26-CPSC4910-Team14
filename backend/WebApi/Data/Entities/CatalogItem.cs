namespace WebApi.Data.Entities;

public class CatalogItem
{
    public int Id { get; set; }
    public int ExternalId { get; set; }

    public int CatalogId { get; set; }
    public Catalog Catalog { get; set; } = null!;
    public decimal CatalogPrice { get; set; }

    // Cached from external API
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required decimal ExternalPrice { get; set; }
    public required string Description { get; set; }
    public int CategoryId { get; set; }
    public required string CategoryTitle { get; set; }
    public required List<string> Images { get; set; } = new();
    public DateTime CachedAtUtc { get; set; }
    public bool IsAvailable { get; set; }
}