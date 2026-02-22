using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using WebApi.Data.Entities;
using WebApi.Features.DriverUsers.Models;
using WebApi.Features.Points.Models;
using WebApi.Features.Users;
using WebApi.Helpers.Pagination;
using Microsoft.AspNetCore.Identity;

namespace WebApi.Features.DriverUsers;

[ApiController]
[Route("/drivers")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IUsersService _usersService;
    private readonly UserManager<User> _userManager;

    public AdminUsersController(AppDbContext db, IUsersService usersService, UserManager<User> userManager)
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
    [Authorize]
    public async Task<ActionResult> GetPoints(int driverId)
    {
        var points = await _db.PointTransactions
            .AsNoTracking()
            .Where(p => p.DriverUserId == driverId)
            .OrderByDescending(p => p.TransactionDateUtc)
            .Select(p => p.BalanceChange)
            .SumAsync();
        return Ok(points);
    }

    [HttpGet("{driverId}/point-transactions")]
    [Authorize]
    public async Task<ActionResult> GetPointTransactions(
        [FromQuery] int driverId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        // Normal EF query but don't await it.
        var query = _db.PointTransactions
            .AsNoTracking()
            .Where(p => p.DriverUserId == driverId)
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
    [Authorize(Policy = PolicyNames.SponsorOnly)]
    public async Task<ActionResult> CreatePointTransaction(CreatePointTransactionModel request)
    {
        var currentUserId = _userManager.GetUserId(User);
        var sponsor = await _db.SponsorUsers
            .AsNoTracking()
            .Where(s => s.UserId == currentUserId)
            .FirstOrDefaultAsync();
        if (sponsor is null)
        {
            return BadRequest();
        }

        // Ensure driver exists and is in the same org as the sponsor.
        var driver = await _db.DriverUsers.Where(d => d.Id == request.DriverId).FirstOrDefaultAsync();
        if (driver is null || driver.SponsorOrgId != sponsor.SponsorOrgId)
        {
            return BadRequest("Invalid driver.");
        }

        var transaction = new PointTransaction
        {
            SponsorOrgId = sponsor.SponsorOrgId,
            DriverUserId = request.DriverId,
            Reason = request.Reason,
            BalanceChange = request.BalanceChange,
            TransactionDateUtc = DateTime.UtcNow
        };
        _db.PointTransactions.Add(transaction);
        _db.SaveChanges();

        return Ok();
    }
    #endregion
}