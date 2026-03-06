using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Helpers.Pagination;
using WebApi.Features.DriverUsers.Models;

namespace WebApi.Features.DriverUsers;

public class DriverUsersService : IDriverUsersService
{
    private readonly AppDbContext _db;

    public DriverUsersService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<DriverUserModel?> GetByUserIdAsync(string userId)
    {
        return await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .Select(d => new DriverUserModel
            {
                Id = d.Id,
                Email = d.User.Email ?? "",
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                DateCreatedUtc = d.User.CreatedDateUtc,
                LastLoginUtc = d.User.LastLoginUtc
            })
            .SingleOrDefaultAsync();
    }

    // TODO: Allow specifying a sponsor org and move sponsor check to controller
    public async Task<DriverUserModel?> GetByIdAsync(int driverId)
    {
        return await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.Id == driverId)
            .Select(d => new DriverUserModel
            {
                Id = d.Id,
                Email = d.User.Email ?? "",
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                DateCreatedUtc = d.User.CreatedDateUtc,
                LastLoginUtc = d.User.LastLoginUtc
            })
            .SingleOrDefaultAsync();
    }

    public async Task<List<SponsorOrgModel>> GetSponsorOrgsFromIdAsync(int driverId)
    {
        return await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.Id == driverId)
            .SelectMany(d => d.SponsorOrgs)
            .Select(o => new SponsorOrgModel
            {
                Id = o.Id,
                SponsorName = o.SponsorName,
                PointRatio = o.PointRatio
            })
            .ToListAsync();
    }

    public async Task<List<SponsorOrgModel>> GetSponsorOrgsFromUserIdAsync(string userId)
    {
        return await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .SelectMany(d => d.SponsorOrgs)
            .Select(o => new SponsorOrgModel
            {
                Id = o.Id,
                SponsorName = o.SponsorName,
                PointRatio = o.PointRatio
            })
            .ToListAsync();
    }

    public async Task<List<PointsModel>> GetPointsByUserIdAsync(string userId, int? orgId)
    {
        var transactions = _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .SelectMany(d => d.PointTransactions);

        if (orgId.HasValue)
            transactions = transactions.Where(t => t.SponsorOrgId == orgId.Value);

        return await transactions
            .GroupBy(t => t.SponsorOrgId)
            .Select(g => new PointsModel
            {
                SponsorOrgId = g.Key,
                Balance = g.Sum(t => t.BalanceChange)
            })
            .ToListAsync();
    }

    // TODO: Allow specifying a sponsor org and move sponsor check to controller
    public async Task<List<PointsModel>> GetPointsByIdAsync(int driverId, int? orgId = null, string? sponsorUserId = null)
    {
        var query = _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.Id == driverId);

        // If a sponsor user is specified, filter by drivers in their org only
        if (sponsorUserId is not null)
        {
            var sponsorOrgIds = _db.SponsorUsers
                .Where(s => s.UserId == sponsorUserId)
                .Select(s => s.SponsorOrgId);

            query = query.Where(d => d.SponsorOrgs.Any(o => sponsorOrgIds.Contains(o.Id)));
        }

        var transactions = query.SelectMany(d => d.PointTransactions);

        // Optionally return points for one org
        if (orgId.HasValue)
            transactions = transactions.Where(t => t.SponsorOrgId == orgId.Value);

        return await transactions
            .GroupBy(t => t.SponsorOrgId)
            .Select(g => new PointsModel
            {
                SponsorOrgId = g.Key,
                Balance = g.Sum(t => t.BalanceChange)
            })
            .ToListAsync();
    }

    public async Task<PagedResult<PointTransactionModel>> GetPointTransactionsByIdAsync(
        int driverId,
        int? orgId = null,
        int page = 1,
        int pageSize = 20,
        string? sign = null,
        DateTime? from = null,
        DateTime? to = null)
    {
        var query = _db.PointTransactions
            .AsNoTracking()
            .Where(p => p.DriverUserId == driverId);

        return await GetPointTransactionsByQueryAsync(query, orgId, page, pageSize, sign, from, to);
    }

    public async Task<PagedResult<PointTransactionModel>> GetPointTransactionsByUserIdAsync(
        string userId,
        int? orgId = null,
        int page = 1,
        int pageSize = 20,
        string? sign = null,
        DateTime? from = null,
        DateTime? to = null)
    {
        var query = _db.PointTransactions
            .AsNoTracking()
            .Where(p => p.DriverUser.UserId == userId);

        return await GetPointTransactionsByQueryAsync(query, orgId, page, pageSize, sign, from, to);
    }

    #region Helpers
    private async Task<PagedResult<PointTransactionModel>> GetPointTransactionsByQueryAsync(
        IQueryable<PointTransaction> query,
        int? orgId = null,
        int page = 1,
        int pageSize = 20,
        string? sign = null,
        DateTime? from = null,
        DateTime? to = null)
    {
        if (orgId.HasValue)
            query = query.Where(p => p.SponsorOrgId == orgId);

        // Filter by present query parameters
        if (from is not null)
            query = query.Where(p => p.TransactionDateUtc >= from);
        if (to is not null)
            query = query.Where(p => p.TransactionDateUtc < to);
        if (sign is not null)
        {
            if (sign == "negative")
                query = query.Where(p => p.BalanceChange < 0);
            else if (sign == "positive")
                query = query.Where(p => p.BalanceChange > 0);
            else
                query = query.Where(p => p.BalanceChange == 0);
        }

        // Finalize query
        var transactions = query.OrderByDescending(p => p.TransactionDateUtc).Select(p => new PointTransactionModel
        {
            Id = p.Id,
            DriverId = p.DriverUserId,
            SponsorOrgId = p.SponsorOrgId,
            BalanceChange = p.BalanceChange,
            Reason = p.Reason,
            TransactionDateUtc = p.TransactionDateUtc
        });

        return await PagedResult.ToPagedResultAsync(transactions, page, pageSize);
    }
    #endregion
}