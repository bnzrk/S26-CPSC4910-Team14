using Microsoft.EntityFrameworkCore;

namespace WebApi.Helpers.Pagination;

public class PagedResult<T>
{
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public required List<T> Items { get; set; }
};

public static class PagedResult
{
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
    IQueryable<T> query,
    int page,
    int pageSize)
    {
        var total = await query.CountAsync();

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<T>
        {
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            Items = items
        };
    }
}