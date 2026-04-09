using WebApi.Features.Catalogs.Models;

namespace WebApi.Features.Catalogs;

public interface ICatalogsService
{
    public Task<CatalogModel> GetOrgCatalogAsync(int orgId);
    public Task CreateCatalogItem(int orgId, int externalItemId, decimal catalogPrice);
    public Task DeleteCatalogItem(int catalogItemId);
    public Task RefreshItemCachesAsync(List<int> itemIds);
}