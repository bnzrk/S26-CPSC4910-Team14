namespace WebApi.Features.Catalogs.Models;

public class CreateCatalogItemModel
{
    public required int ExternalItemId { get; set; }
    public required decimal CatalogPrice { get; set; }
}