using WebApi.Features.Store.Models;

namespace WebApi.Features.Store;

public interface IStoreClient
{
    Task<StoreItemModel?> GetItemAsync(int externalId);
}
