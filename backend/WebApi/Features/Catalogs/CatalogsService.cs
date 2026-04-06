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
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IStoreClient _store;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromHours(1);

    public CatalogsService(AppDbContext db, IStoreClient store, IServiceScopeFactory scopeFactory)
    {
        _db = db;
        _store = store;
        _scopeFactory = scopeFactory;
    }

    public async Task<List<CatalogItemModel>> GetOrgCatalogAsync(int orgId)
    {
        var items = await _db.Catalogs
            .AsNoTracking()
            .Where(c => c.SponsorOrgId == orgId)
            .SelectMany(c => c.Items)
            .ToListAsync();

        var models = new List<CatalogItemModel>();

        var staleIds = new List<int>();
        foreach (var i in items)
        {
            var isStale = DateTime.UtcNow - i.CachedAtUtc > _cacheDuration;
            if (isStale)
                staleIds.Add(i.Id);

            models.Add(new CatalogItemModel
            {
                Id = i.Id,
                CatalogId = i.CatalogId,
                ExternalId = i.ExternalId,
                Title = i.Title,
                Description = i.Description,
                Slug = i.Slug,
                CateogryId = i.CategoryId,
                CategoryTitle = i.CategoryTitle,
                ExternalPrice = i.ExternalPrice,
                Price = i.CatalogPrice,
                Images = i.Images,
                IsAvailable = i.IsAvailable
            });
        }

        if (staleIds.Any())
            _ = Task.Run(() => RefreshItemCachesAsync(staleIds));

        return models;
    }

    public async Task RefreshItemCachesAsync(List<int> itemIds)
    {
        // Because we're accessing the database in a thread, we need to make a new scope
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var store = scope.ServiceProvider.GetRequiredService<IStoreClient>();

        var items = await db.CatalogItems.Where(i => itemIds.Contains(i.Id)).ToListAsync();

        // Wait for all parallel cache updates to finish before saving
        await Task.WhenAll(items.Select(async item =>
        {
            item.CachedAtUtc = DateTime.UtcNow;

            var fresh = await store.GetItemAsync(item.ExternalId);
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
            item.IsAvailable = true;
        }));

        await db.SaveChangesAsync();
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