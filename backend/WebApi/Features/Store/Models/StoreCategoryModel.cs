namespace WebApi.Features.Store.Models;

public class StoreCategoryModel
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
}