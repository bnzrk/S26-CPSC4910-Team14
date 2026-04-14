using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Features.PointTransactions.Models;
using WebApi.Helpers.Pagination;

namespace WebApi.Features.PointTransactions;

[ApiController]
[Route("/point-transactions")]
public class PointTransactionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;

    public PointTransactionsController(AppDbContext db, UserManager<User> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.SponsorOnly)]
    public async Task<ActionResult<PagedResult<PointTransactionModel>>> GetPointTransactions(
        int? driverId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20
    )
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var sponsorOrgId = await _db.SponsorUsers
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.SponsorOrgId)
            .SingleOrDefaultAsync();
        if (!sponsorOrgId.HasValue)
            return NotFound();

        var dbQuery = _db.PointTransactions
            .Where(t => t.SponsorOrgId == sponsorOrgId);

        if (driverId.HasValue)
        {
            var isDriverInOrg = await _db.DriverUsers
                .AnyAsync(d => d.Id == driverId.Value && d.SponsorOrgs.Any(o => o.Id == sponsorOrgId));
            if (!isDriverInOrg)
                return NotFound();

            dbQuery = dbQuery.Where(t => t.DriverUserId == driverId);
        }

        if (from.HasValue)
            dbQuery = dbQuery.Where(t => t.TransactionDateUtc >= from.Value);
        if (to.HasValue)
            dbQuery = dbQuery.Where(t => t.TransactionDateUtc <= to.Value);

        var pageQuery = dbQuery
            .OrderByDescending(t => t.TransactionDateUtc)
            .Select(t => new PointTransactionModel
            {
                DriverId = t.DriverUserId,
                DriverName = $"{t.DriverUser.User.FirstName} {t.DriverUser.User.LastName}",
                DriverEmail = t.DriverUser.User.Email!,
                DriverTotalPoints = t.DriverUser.PointTransactions
                    .Where(p => p.SponsorOrgId == sponsorOrgId)
                    .OrderByDescending(p => p.TransactionDateUtc)
                    .Sum(p => p.BalanceChange),
                BalanceChange = t.BalanceChange,
                Reason = t.Reason,
                TransactionDateUtc = t.TransactionDateUtc,
                SponsorName = t.SponsorOrg.SponsorName
            });

        var pageResult = await PagedResult.ToPagedResultAsync(pageQuery, page, pageSize);
        return Ok(pageResult);
    }
}