using WebApi.Features.Catalogs.Models;

namespace WebApi.Features.Catalogs;

public interface ICatalogsService
{
    public Task<List<CatalogItemModel>> GetOrgCatalogAsync(int orgId);
    public Task CreateCatalogItem(int orgId, int externalItemId, decimal catalogPrice);
    public Task DeleteCatalogItem(int catalogItemId);
}