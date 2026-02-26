using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using WebApi.Data.Entities;
using WebApi.Features.DriverUsers.Models;
using WebApi.Features.Users;
using WebApi.Helpers.Pagination;
using WebApi.Data.Enums;

namespace WebApi.Features.DriverUsers;

[ApiController]
[Route("/drivers")]
public class DriverUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IUsersService _usersService;
    private readonly UserManager<User> _userManager;

    public DriverUsersController(AppDbContext db, IUsersService usersService, UserManager<User> userManager)
    {
        _db = db;
        _usersService = usersService;
        _userManager = userManager;
    }

    #region Account
    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult> Register(RegisterDriverUserModel request)
    {
        var result = await _usersService.CreateDriverUser(request.Email, request.Password, request.FirstName, request.LastName);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description).ToArray()
            });
        }

        return Created();
    }
    #endregion

    #region Points
    [HttpGet("{driverId}/points")]
    [HttpGet("points")]
    [Authorize]
    public async Task<ActionResult> GetPoints(int? driverId)
    {
        var resolvedDriverId = driverId ?? await GetCurrentDriverId();
        if (resolvedDriverId is null) return BadRequest();

        var points = await _db.PointTransactions
            .AsNoTracking()
            .Where(p => p.DriverUserId == resolvedDriverId)
            .OrderByDescending(p => p.TransactionDateUtc)
            .Select(p => p.BalanceChange)
            .SumAsync();
        return Ok(points);
    }

    [HttpGet("{driverId}/point-transactions")]
    [HttpGet("point-transactions")]
    [Authorize]
    public async Task<ActionResult> GetPointTransactions(
        int? driverId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var resolvedDriverId = driverId ?? await GetCurrentDriverId();
        if (resolvedDriverId is null) return BadRequest();

        // Normal EF query but don't await it.
        var query = _db.PointTransactions
            .AsNoTracking()
            .Where(p => p.DriverUserId == resolvedDriverId)
            .OrderByDescending(p => p.TransactionDateUtc)
            .Select(p => new PointTransactionModel
            {
                Id = p.Id,
                DriverId = p.DriverUserId,
                SponsorOrgId = p.SponsorOrgId,
                BalanceChange = p.BalanceChange,
                Reason = p.Reason,
                TransactionDateUtc = p.TransactionDateUtc
            });

        // Perform pagination on the query and await the result.
        var pageResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);

        return Ok(pageResult);
    }

    [HttpPost("{driverId}/point-transactions")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> CreatePointTransaction(int driverId, [FromBody] CreatePointTransactionModel request)
    {
        // Ensure driver exists and is in an org.
        var driver = await _db.DriverUsers.Where(d => d.Id == driverId).FirstOrDefaultAsync();
        if (driver is null || driver.SponsorOrgId is null)
        {
            return BadRequest("Invalid driver.");
        }

        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            var userId = _userManager.GetUserId(User);
            var sponsor = await _db.SponsorUsers
                .AsNoTracking()
                .Where(s => s.UserId == userId)
                .FirstOrDefaultAsync();
            if (sponsor is null || sponsor.SponsorOrgId != driver.SponsorOrgId)
            {
                return BadRequest("Cannot modify points for an organization you are not a sponsor for.");
            }
        }

        var transaction = new PointTransaction
        {
            SponsorOrgId = driver.SponsorOrgId.Value,
            DriverUserId = driverId,
            Reason = request.Reason,
            BalanceChange = request.BalanceChange,
            TransactionDateUtc = DateTime.UtcNow
        };
        _db.PointTransactions.Add(transaction);
        _db.SaveChanges();

        return Ok();
    }
    #endregion

    private async Task<int?> GetCurrentDriverId()
    {
        var userId = _userManager.GetUserId(User);
        return await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .Select(d => (int?)d.Id)
            .FirstOrDefaultAsync();
    }
}