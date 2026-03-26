using WebApi.Features.Store.Models;

namespace WebApi.Features.Store;

public class StoreClient : IStoreClient
{
    private readonly HttpClient _http;

    public StoreClient(HttpClient http)
    {
        _http = http;
    }

    public async Task<StoreItemModel?> GetItemAsync(int externalId)
    {
        var response = await _http.GetAsync($"products/{externalId}");
        try
        {
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<StoreItemModel>();
        }
        catch
        {
            return null;
        }
    }
}