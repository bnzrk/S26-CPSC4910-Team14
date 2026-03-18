namespace WebApi.Data.Entities;

public class CatalogItem
{
    public int Id { get; set; }
    public int ExternalId { get; set; }

    public int CatalogId { get; set; }
    public Catalog Catalog { get; set; } = null!;
    public decimal CatalogPrice { get; set; }
}