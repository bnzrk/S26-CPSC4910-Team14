using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Bcpg.Sig;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Features.Catalogs.Models;
using WebApi.Features.Store;

namespace WebApi.Features.Catalogs;

public class CatalogsService : ICatalogsService
{
    private readonly AppDbContext _db;
    private readonly IStoreClient _store;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(1);

    public CatalogsService(AppDbContext db, IStoreClient store)
    {
        _db = db;
        _store = store;
    }

    public async Task<List<CatalogItemModel>> GetOrgCatalogAsync(int orgId)
    {
        var items = await _db.Catalogs
            .Where(c => c.SponsorOrgId == orgId)
            .SelectMany(c => c.Items)
            .ToListAsync();

        var models = new List<CatalogItemModel>();

        var staleCount = 0;
        foreach (var i in items)
        {
            var isStale = DateTime.UtcNow - i.CachedAtUtc > _cacheDuration;
            if (isStale)
            {
                staleCount++;
                await RefreshItemCacheAsync(i);   
            }

            models.Add(new CatalogItemModel
            {
                Id = i.Id,
                CatalogId = i.CatalogId,
                ExternalId = i.ExternalId,
                Title = i.Title,
                Description = i.Description,
                Slug = i.Slug,
                ExternalPrice = i.ExternalPrice,
                Price = i.CatalogPrice,
                Images = i.Images,
                IsAvailable = i.IsAvailable
            });
        }

        if (staleCount > 0)
            await _db.SaveChangesAsync();

        return models;
    }

    private async Task RefreshItemCacheAsync(CatalogItem item)
    {
        var fresh = await _store.GetItemAsync(item.ExternalId);
        if (fresh is null)
        {
            item.IsAvailable = false;
            return;
        }

        item.Title = fresh.Title;
        item.Slug = fresh.Slug;
        item.Description = fresh.Description;
        item.ExternalPrice = fresh.Price;
        item.CategoryId = fresh.Category.Id;
        item.CategoryTitle = fresh.Category.Name;
        item.Images = fresh.Images;
        item.CachedAtUtc = DateTime.UtcNow;
        item.IsAvailable = true;
    }

    public async Task CreateCatalogItem(int orgId, int externalItemId, decimal catalogPrice)
    {
        var catalog = await _db.Catalogs.Where(c => c.SponsorOrgId == orgId).SingleOrDefaultAsync();
        if (catalog is null)
            throw new Exception($"Catalog does not exist for sponsor org {orgId}.");

        // Validate the item with external API
        var externalItem = await _store.GetItemAsync(externalItemId);
        if (externalItem is null)
            throw new Exception($"Item {externalItemId} does not exist in external API.");

        // Create item with cached fields
        var item = new CatalogItem
        {
            ExternalId = externalItemId,
            CatalogPrice = catalogPrice,
            Title = externalItem.Title,
            Description = externalItem.Description,
            Slug = externalItem.Slug,
            ExternalPrice = externalItem.Price,
            CategoryId = externalItem.Category.Id,
            CategoryTitle = externalItem.Category.Name,
            Images = externalItem.Images,
            CachedAtUtc = DateTime.UtcNow,
            IsAvailable = true,
        };

        catalog.Items.Add(item);
        await _db.SaveChangesAsync();
    }

    public async Task DeleteCatalogItem(int catalogItemId)
    {
        var item = await _db.CatalogItems
            .Include(i => i.Catalog)
            .Where(i => i.Id == catalogItemId)
            .SingleOrDefaultAsync();
        if (item is null)
            throw new Exception("Item does not exist.");

        _db.CatalogItems.Remove(item);
        await _db.SaveChangesAsync();
    }
}