using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Helpers.Pagination;

namespace WebApi.Features.PointTransactions;

[ApiController]
[Authorize(Policy = PolicyNames.AdminOrSponsor)]
[Route("/sales")]
public class SaleStatisticsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IDbContextFactory<AppDbContext> _dbContextFactory;
    private readonly UserManager<User> _userManager;

    public SaleStatisticsController(AppDbContext db, IDbContextFactory<AppDbContext> dbContextFactory, UserManager<User> userManager)
    {
        _db = db;
        _dbContextFactory = dbContextFactory;
        _userManager = userManager;
    }

    [HttpGet("monthly-summary")]
    public async Task<ActionResult> GetMonthlySummary(
        [FromQuery] int? orgId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (orgId.HasValue)
                return BadRequest("Sponsors should not specify an organization.");

            orgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
        }

        if (!orgId.HasValue)
            return BadRequest("Missing org id.");

        var firstOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var now = DateTime.UtcNow;
        var (firstOfPrevMonth, endOfPrevMonth) = PreviousMonth();

        // Points issued summary
        var pointsIssued = GetPointsIssued(orgId.Value, firstOfMonth, now);
        var prevPointIssued = GetPointsIssued(orgId.Value, firstOfPrevMonth, endOfPrevMonth);

        // Expenses summary 
        var expenses = GetConfirmedExpenses(orgId.Value, firstOfMonth, now);
        var prevExpenses = GetConfirmedExpenses(orgId.Value, firstOfPrevMonth, endOfPrevMonth);
        var pendingExpenses = GetPendingExpenses(orgId.Value, firstOfMonth, now);

        await Task.WhenAll(pointsIssued, prevPointIssued, expenses, prevExpenses, pendingExpenses);

        var summary = new
        {
            PointsIssued = pointsIssued.Result,
            PrevPointsIssued = prevPointIssued.Result,
            Expenses = expenses.Result,
            PrevExpenses = prevExpenses.Result,
            PendingExpenses = pendingExpenses.Result
        };

        return Ok(summary);
    }

    [HttpGet("six-month-summary")]
    public async Task<ActionResult> GetSixMonthSummary([FromQuery] int? orgId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (orgId.HasValue)
                return BadRequest("Sponsors should not specify an organization.");
            orgId = await _db.SponsorUsers
                .Where(s => s.UserId == userId)
                .Select(s => (int?)s.SponsorOrgId)
                .SingleOrDefaultAsync();
        }

        if (!orgId.HasValue)
            return BadRequest("Missing org id.");

        var now = DateTime.UtcNow;
        var sixMonthsAgo = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-5);

        var pointsTask = GetPointsChartAsync(orgId.Value, sixMonthsAgo, now);
        var expensesTask = GetExpensesChartAsync(orgId.Value, sixMonthsAgo, now);

        await Task.WhenAll(pointsTask, expensesTask);

        // Merge into unified months
        var months = Enumerable.Range(0, 6)
            .Select(i => new DateTime(sixMonthsAgo.Year, sixMonthsAgo.Month, 1).AddMonths(i))
            .Select(month => new
            {
                Month = month.Month,
                Year = month.Year,
                Points = pointsTask.Result.TryGetValue(month, out var pts) ? pts : 0,
                ExpensesUsd = expensesTask.Result.TryGetValue(month, out var exp) ? exp : 0
            });

        return Ok(months);
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> GetSales(
        [FromQuery] int? orgId = null,
        [FromQuery] int? driverId = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10
    )
    {
        var ordersQuery = _db.Orders
            .Where(o => !o.IsRefunded);

        // Date filter
        if (from.HasValue)
            ordersQuery = ordersQuery.Where(o => o.PlacedDateUtc >= from);
        if (to.HasValue)
            ordersQuery = ordersQuery.Where(o => o.PlacedDateUtc < to);
        // Org and driver filter
        if (orgId.HasValue)
            ordersQuery = ordersQuery.Where(o => o.SponsorOrgId == orgId.Value);
        if (driverId.HasValue)
            ordersQuery = ordersQuery.Where(o => o.DriverId == driverId.Value);

        var salesQuery = ordersQuery
            .OrderByDescending(o => o.PlacedDateUtc)
            .Select(o => new
            {
                SponsorName = o.SponsorOrg.SponsorName,
                DriverName = o.Driver.User.FirstName + " " + o.Driver.User.LastName,
                DriverEmail = o.Driver.User.Email!,
                SaleDateUtc = o.PlacedDateUtc,
                TotalUsd = o.Items.Sum(i => i.PriceUsd),
            });

        var pageResult = await PagedResult.ToPagedResultAsync(salesQuery, page, pageSize);
        return Ok(pageResult);
    }

    [HttpGet("invoices")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> GetInvoices(
    [FromQuery] int? orgId,
    [FromQuery] DateTime? from,
    [FromQuery] DateTime? to)
    {
        var orgQuery = _db.SponsorOrgs.AsQueryable();
        if (orgId.HasValue)
            orgQuery = orgQuery.Where(o => o.Id == orgId.Value);

        var invoices = await orgQuery
            .Select(org => new
            {
                SponsorOrgId = org.Id,
                SponsorOrgName = org.SponsorName,
                DriverFees = org.DriverUsers
                    .Select(driver => new
                    {
                        Id = driver.Id,
                        Name = $"{driver.User.FirstName} {driver.User.LastName}",
                        Email = driver.User.Email,
                        FeeUsd = driver.Orders
                            .Where(o => o.Status != OrderStatus.Cancelled
                                && o.SponsorOrgId == org.Id
                                && !o.IsRefunded
                                && (from == null || o.PlacedDateUtc >= from)
                                && (to == null || o.PlacedDateUtc <= to))
                            .SelectMany(o => o.Items)
                            .Sum(i => i.PriceUsd)
                    })
                    .ToList(),
                TotalFeeUsd = org.DriverUsers
                    .SelectMany(driver => driver.Orders
                        .Where(o => o.Status != OrderStatus.Cancelled
                            && o.SponsorOrgId == org.Id
                            && !o.IsRefunded
                            && (from == null || o.PlacedDateUtc >= from)
                            && (to == null || o.PlacedDateUtc <= to))
                        .SelectMany(o => o.Items))
                    .Sum(i => i.PriceUsd)
            }).ToListAsync();

        return Ok(invoices);
    }

    private async Task<Dictionary<DateTime, int>> GetPointsChartAsync(int orgId, DateTime from, DateTime to)
    {
        await using var db = _dbContextFactory.CreateDbContext();
        var rows = await db.PointTransactions
            .Where(t => t.SponsorOrgId == orgId && t.BalanceChange > 0 && t.TransactionDateUtc >= from && t.TransactionDateUtc <= to)
            .GroupBy(t => new { t.TransactionDateUtc.Year, t.TransactionDateUtc.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Total = g.Sum(t => t.BalanceChange) })
            .ToListAsync();

        return rows.ToDictionary(
            r => new DateTime(r.Year, r.Month, 1),
            r => r.Total
        );
    }

    private async Task<Dictionary<DateTime, decimal>> GetExpensesChartAsync(int orgId, DateTime from, DateTime to)
    {
        await using var db = _dbContextFactory.CreateDbContext();
        var rows = await db.DriverUsers
            .SelectMany(d => d.Orders)
            .Where(o => !o.IsRefunded && o.Status != OrderStatus.Cancelled && o.SponsorOrgId == orgId && o.PlacedDateUtc >= from && o.PlacedDateUtc <= to)
            .GroupBy(o => new { o.PlacedDateUtc.Year, o.PlacedDateUtc.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Total = g.SelectMany(o => o.Items).Sum(i => i.VendorPriceUsd) })
            .ToListAsync();

        return rows.ToDictionary(
            r => new DateTime(r.Year, r.Month, 1),
            r => r.Total
        );
    }

    private async Task<decimal> GetConfirmedExpenses(int orgId, DateTime? from, DateTime? to)
    {
        await using var db = _dbContextFactory.CreateDbContext();
        var expenseQuery = db.DriverUsers
            .SelectMany(d => d.Orders)
            .Where(o => !o.IsRefunded && o.Status > OrderStatus.Placed && o.Status != OrderStatus.Cancelled && o.SponsorOrgId == orgId);
        if (from is not null)
            expenseQuery = expenseQuery.Where(o => o.PlacedDateUtc >= from);
        if (to is not null)
            expenseQuery = expenseQuery.Where(o => o.PlacedDateUtc < to);

        return await expenseQuery.SelectMany(o => o.Items)
            .SumAsync(i => i.VendorPriceUsd);
    }

    private async Task<decimal> GetPendingExpenses(int orgId, DateTime? from, DateTime? to)
    {
        await using var db = _dbContextFactory.CreateDbContext();
        var expenseQuery = db.DriverUsers
            .SelectMany(d => d.Orders)
            .Where(o => !o.IsRefunded && o.Status == OrderStatus.Placed && o.SponsorOrgId == orgId);
        if (from is not null)
            expenseQuery = expenseQuery.Where(o => o.PlacedDateUtc >= from);
        if (to is not null)
            expenseQuery = expenseQuery.Where(o => o.PlacedDateUtc < to);

        return await expenseQuery.SelectMany(o => o.Items)
            .SumAsync(i => i.VendorPriceUsd);
    }

    private async Task<int> GetPointsIssued(int orgId, DateTime? from, DateTime? to)
    {
        await using var db = _dbContextFactory.CreateDbContext();
        var pointQuery = db.PointTransactions
            .Where(t => t.SponsorOrgId == orgId && t.BalanceChange > 0);

        if (from is not null)
            pointQuery = pointQuery.Where(t => t.TransactionDateUtc >= from);
        if (to is not null)
            pointQuery = pointQuery.Where(t => t.TransactionDateUtc < to);

        return await pointQuery.SumAsync(t => t.BalanceChange);
    }

    private async Task<int> GetPointsSpent(int orgId, DateTime? from, DateTime? to)
    {
        await using var db = _dbContextFactory.CreateDbContext();
        var expenseQuery = db.DriverUsers
            .SelectMany(d => d.Orders)
            .Where(o => !o.IsRefunded && o.Status != OrderStatus.Cancelled && o.SponsorOrgId == orgId);
        if (from is not null)
            expenseQuery = expenseQuery.Where(o => o.PlacedDateUtc >= from);
        if (to is not null)
            expenseQuery = expenseQuery.Where(o => o.PlacedDateUtc < to);

        return await expenseQuery.SelectMany(o => o.Items)
            .SumAsync(i => i.PricePoints);
    }

    private (DateTime from, DateTime to) PreviousMonth()
    {
        var now = DateTime.UtcNow;
        var firstOfPrevMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(-1);
        var lastOfPrevMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddTicks(-1);
        return (firstOfPrevMonth, lastOfPrevMonth);
    }
}