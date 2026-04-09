namespace WebApi.Features.Catalogs.Models;

public class CatalogModel
{
    public required int Id { get; set; }
    public required List<CatalogItemModel> Items { get; set; } = new();
}