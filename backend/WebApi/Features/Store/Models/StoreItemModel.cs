namespace WebApi.Features.Store.Models;

public class StoreItemModel
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string Description { get; set; }
    public decimal Price { get; set; }
    public required StoreCategoryModel Category { get; set; }
    public List<string> Images { get; set; } = new List<string>();
}