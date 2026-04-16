using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data.Enums;
using WebApi.Data.Entities;
using WebApi.Features.Catalogs.Models;
using WebApi.Data;
using Microsoft.EntityFrameworkCore;
using WebApi.Audit;

namespace WebApi.Features.Catalogs;

[ApiController]
[Route("/sponsor-orgs/{orgId}/catalog")]
public class CatalogsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICatalogsService _catalogs;
    private readonly UserManager<User> _userManager;
    private readonly IAuditLogger _auditLogger;

    public CatalogsController(AppDbContext db, ICatalogsService catalogs, UserManager<User> userManager, IAuditLogger auditLogger)
    {
        _db = db;
        _catalogs = catalogs;
        _userManager = userManager;
        _auditLogger = auditLogger;
    }

    [HttpGet("monthly-spending")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult<CatalogSpendModel>> GetCatalogSpendingThisMonth(int orgId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var isInOrg = await _db.SponsorUsers
                .AsNoTracking()
                .AnyAsync(s => s.UserId == userId && s.SponsorOrgId == orgId);

            if (!isInOrg)
                return NotFound();
        }

        var firstOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var now = DateTime.UtcNow;

        var monthlySpentPoints = await _db.DriverUsers
            .SelectMany(d => d.Orders)
            .Where(o => !o.IsRefunded && o.SponsorOrgId == orgId && o.PlacedDateUtc >= firstOfMonth && o.PlacedDateUtc <= now)
            .SelectMany(o => o.Items)
            .SumAsync(i => i.PricePoints);

        var monthlySpentUsd = await _db.DriverUsers
            .SelectMany(d => d.Orders)
            .Where(o => !o.IsRefunded && o.SponsorOrgId == orgId && o.PlacedDateUtc >= firstOfMonth && o.PlacedDateUtc <= now)
            .SelectMany(o => o.Items)
            .SumAsync(i => i.PriceUsd);

        var monthlyExpenseUsd = await _db.DriverUsers
            .SelectMany(d => d.Orders)
            .Where(o => !o.IsRefunded && o.SponsorOrgId == orgId && o.PlacedDateUtc >= firstOfMonth && o.PlacedDateUtc <= now)
            .SelectMany(o => o.Items)
            .SumAsync(i => i.VendorPriceUsd);

        var monthlyIssuedPoints = await _db.PointTransactions
            .Where(t => t.SponsorOrgId == orgId && t.BalanceChange > 0 && t.TransactionDateUtc >= firstOfMonth && t.TransactionDateUtc <= now)
            .SumAsync(t => t.BalanceChange);

        // add monthly pending expenses
        // add previous month spending

        return Ok(new CatalogSpendModel
        {
            MonthlyPointsIssued = monthlyIssuedPoints,
            MonthlyPointsSpent = monthlySpentPoints,
            MonthlyUsdSpent = monthlySpentUsd,
            MonthlyExpensesUsd = monthlyExpenseUsd
        });
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<CatalogModel>> GetCatalog(int orgId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isDriver = User.IsInRole(UserTypeRoles.Role(UserType.Driver));
        if (isSponsor || isDriver)
        {
            var isInOrg = isSponsor
                ? await _db.SponsorUsers
                    .AsNoTracking()
                    .AnyAsync(s => s.UserId == userId && s.SponsorOrgId == orgId)
                : await _db.DriverUsers
                    .AsNoTracking()
                    .Include(d => d.SponsorOrgs)
                    .AnyAsync(d => d.UserId == userId && d.SponsorOrgs.Any(o => o.Id == orgId));

            if (!isInOrg)
                return NotFound();
        }

        try
        {
            var items = await _catalogs.GetOrgCatalogAsync(orgId);
            return Ok(items);
        }
        catch { }

        return NotFound();
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> CreateCatalogItem(int orgId, [FromBody] CreateCatalogItemModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var isInOrg = await _db.SponsorUsers.AnyAsync(s => s.UserId == userId && s.SponsorOrgId == orgId);
            if (!isInOrg)
                return NotFound();
        }

        try
        {
            await _catalogs.CreateCatalogItem(orgId, request.ExternalItemId, request.CatalogPrice);
            await _auditLogger.CreateCatalogChangeAuditLog(orgId, "Created", request.ExternalItemId);
            return Created();
        }
        catch { }

        return BadRequest();
    }

    [HttpDelete("{itemId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> DeleteCatalogItem(int orgId, int itemId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        // Ensure item exists
        var isItemInCatalog = await _db.Catalogs
            .AsNoTracking()
            .Where(c => c.SponsorOrgId == orgId)
            .SelectMany(c => c.Items)
            .AnyAsync(i => i.Id == itemId);
        if (!isItemInCatalog)
            return NotFound();

        // Ensure access allowed if sponsor user
        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var isInOrg = await _db.SponsorUsers.AnyAsync(s => s.UserId == userId && s.SponsorOrgId == orgId);
            if (!isInOrg)
                return NotFound();
        }

        // Try delete
        try
        {
            await _catalogs.DeleteCatalogItem(itemId);
            await _auditLogger.CreateCatalogChangeAuditLog(orgId, "Deleted", itemId);
            return Ok();
        }
        catch { }

        return BadRequest();
    }

    [HttpPut("{itemId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> UpdateCatalogItem(int orgId, int itemId, [FromBody] UpdateCatalogItemModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        // Ensure item exists
        var item = await _db.Catalogs
            .Where(c => c.SponsorOrgId == orgId)
            .SelectMany(c => c.Items)
            .Where(i => i.Id == itemId)
            .SingleOrDefaultAsync();

        if (item is null)
            return NotFound();

        // Ensure access allowed if sponsor user
        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var isInOrg = await _db.SponsorUsers.AnyAsync(s => s.UserId == userId && s.SponsorOrgId == orgId);
            if (!isInOrg)
                return NotFound();
        }

        // Try update
        try
        {
            item.CatalogPrice = request.Price;
            await _db.SaveChangesAsync();
            return Ok();
        }
        catch { }

        return BadRequest();
    }
}