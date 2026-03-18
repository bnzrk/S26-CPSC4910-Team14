using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.EntityFrameworkCore.Query;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Features.Catalogs.Models;
using WebApi.Features.Store;

namespace WebApi.Features.Catalogs;

public class CatalogsService : ICatalogsService
{
    private readonly AppDbContext _db;
    private readonly IStoreClient _store;

    public CatalogsService(AppDbContext db, IStoreClient store)
    {
        _db = db;
        _store = store;
    }

    public async Task<List<CatalogItemModel>> GetOrgCatalogAsync(int orgId)
    {
        var items = await _db.Catalogs
            .AsNoTracking()
            .Where(c => c.SponsorOrgId == orgId)
            .SelectMany(c => c.Items)
            .ToListAsync();

        var models = new List<CatalogItemModel>();

        foreach (var i in items)
        {
            var externalItem = await _store.GetItemAsync(i.ExternalId);
            if (externalItem is not null)
                models.Add(new CatalogItemModel
                {
                    Id = i.Id,
                    CatalogId = i.CatalogId,
                    ExternalId = i.ExternalId,
                    Title = externalItem.Title,
                    Description = externalItem.Description,
                    Slug = externalItem.Slug,
                    ExternalPrice = externalItem.Price,
                    Price = i.CatalogPrice,
                    Images = externalItem.Images
                });
        }

        return models;
    }

    public async Task CreateCatalogItem(int orgId, int externalItemId, decimal catalogPrice)
    {
        var catalog = await _db.Catalogs.Where(c => c.SponsorOrgId == orgId).SingleOrDefaultAsync();
        if (catalog is null)
            throw new Exception($"Catalog does not exist for sponsor org {orgId}.");
        
        var item = new CatalogItem
        {
            ExternalId = externalItemId,
            CatalogPrice = catalogPrice
        };

        catalog.Items.Add(item);
        await _db.SaveChangesAsync();
    }

    public async Task<List<CatalogItemModel>> GetTestCatalogItemsAsync()
    {
        var items = await _store.GetTestItemsAsync();
        if (items is null)
            return [];

        else
            return items
                .Select(i => new CatalogItemModel
                {
                    Id = 0,
                    CatalogId = 0,
                    ExternalId = i.Id,
                    Title = i.Title,
                    Description = i.Description,
                    Slug = i.Slug,
                    ExternalPrice = i.Price,
                    Price = 100m,
                    Images = i.Images
                })
                .ToList();
    }
}