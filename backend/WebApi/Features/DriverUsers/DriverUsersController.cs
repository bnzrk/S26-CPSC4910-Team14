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
using WebApi.Audit;
using WebApi.Features.Auth;
using WebApi.Features.Alerts;

namespace WebApi.Features.DriverUsers;

[ApiController]
[Route("/drivers")]
public class DriverUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IUsersService _usersService;
    private readonly UserManager<User> _userManager;
    private readonly IDriverUsersService _driversService;
    private readonly IAuditLogger _auditLogger;
    private readonly IImpersonationService _impersonationService;
    private readonly IAlertsService _alertsService;

    public DriverUsersController(
        AppDbContext db,
        IUsersService usersService,
        UserManager<User> userManager,
        IDriverUsersService driversService,
        IAuditLogger auditLogger,
        IImpersonationService impersonationService,
        IAlertsService alertsService)
    {
        _db = db;
        _usersService = usersService;
        _userManager = userManager;
        _driversService = driversService;
        _auditLogger = auditLogger;
        _impersonationService = impersonationService;
        _alertsService = alertsService;
    }

    #region Drivers
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

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> CreateDriverUser([FromQuery] int? orgId, RegisterDriverUserModel request)
    {
        SponsorOrg? org = null;
        if (orgId.HasValue)
        {
            org = await _db.SponsorOrgs.Where(s => s.Id == orgId.Value).SingleOrDefaultAsync();
            if (org is null)
                return NotFound("Organization not found.");
        }

        var result = await _usersService.CreateDriverUser(request.Email, request.Password, request.FirstName, request.LastName, org);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description).ToArray()
            });
        }

        return Created();
    }

    [HttpGet("me")]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult<DriverUserModel>> GetMe()
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driver = await _driversService.GetByUserIdAsync(userId);
        if (driver is null)
            return Unauthorized();

        return Ok(driver);
    }

    [HttpPatch("{driverId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> UpdateDriverUser(int driverId, UpdateDriverUserModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor && !await IsDriverInSponsorUserOrg(driverId, userId))
            return NotFound();

        var driver = await _db.DriverUsers.Where(d => d.Id == driverId).Include(d => d.User).SingleOrDefaultAsync();
        if (driver is null)
            return NotFound();

        var driverUser = driver.User;

        driverUser.FirstName = request.FirstName ?? driverUser.FirstName;
        driverUser.LastName = request.LastName ?? driverUser.LastName;
        driverUser.Email = request.Email ?? driverUser.Email;
        driverUser.UserName = request.Email ?? driverUser.UserName;
        driverUser.NormalizedEmail = driverUser.Email!.ToUpper();
        driverUser.NormalizedUserName = request.Email!.ToUpper();
        var result = await _userManager.UpdateAsync(driverUser);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        return Ok();
    }

    [HttpGet("{driverId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult<DriverUserModel>> GetDriverUser(int driverId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor && !await IsDriverInSponsorUserOrg(driverId, userId))
            return NotFound();

        var driver = await _driversService.GetByIdAsync(driverId);
        if (driver is null)
            return NotFound();

        return Ok(driver);
    }
    #endregion

    #region Sponsor Orgs
    [HttpGet("me/sponsor-orgs")]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult<List<SponsorOrgModel>>> GetMySponsorOrgs()
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        // Limit the returned org info if impersonating with an org scope
        if (_impersonationService.IsImpersonating(User))
        {
            var scopeId = _impersonationService.GetSponsorOrgScopeId(User);
            if (scopeId is not null)
            {
                var org = _db.SponsorOrgs
                    .AsNoTracking()
                    .Where(o => o.Id == scopeId.Value)
                    .Select(o => new SponsorOrgModel
                    {
                        Id = o.Id,
                        SponsorName = o.SponsorName,
                        PointRatio = o.PointRatio
                    });

                return Ok(new List<SponsorOrgModel>(org));
            }
        }

        // If not impersonating, return all
        var orgs = await _driversService.GetSponsorOrgsFromUserIdAsync(userId);
        return Ok(orgs);
    }

    [HttpGet("{driverId}/sponsor-orgs")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult<List<SponsorOrgModel>>> GetSponsorOrgs(int driverId)
    {
        var orgs = await _driversService.GetSponsorOrgsFromIdAsync(driverId);

        return Ok(orgs);
    }
    #endregion

    #region Points
    [HttpGet("me/points")]
    public async Task<ActionResult<List<PointsModel>>> GetAllMyPoints([FromQuery] int? orgId = null)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var points = await _driversService.GetPointsByUserIdAsync(userId, orgId);

        return Ok(points);
    }

    [HttpGet("me/points/{orgId}")]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult<PointsModel>> GetMyPoints(int orgId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var balance = await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .SelectMany(d => d.PointTransactions)
            .Where(t => t.SponsorOrgId == orgId)
            .SumAsync(t => t.BalanceChange);

        return Ok(new PointsModel
        {
            SponsorOrgId = orgId,
            Balance = balance
        });
    }

    [HttpGet("{driverId}/points/{orgId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult<PointsModel>> GetPoints(int driverId, int orgId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var sponsorOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (sponsorOrgId is null || sponsorOrgId != orgId)
                return NotFound();
        }

        var balance = await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.Id == driverId)
            .SelectMany(d => d.PointTransactions)
            .Where(t => t.SponsorOrgId == orgId)
            .SumAsync(t => t.BalanceChange);

        return Ok(new PointsModel
        {
            SponsorOrgId = orgId,
            Balance = balance
        });
    }

    [HttpGet("{driverId}/points")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult<List<PointsModel>>> GetAllPoints(int driverId)
    {
        var points = await _driversService.GetPointsByIdAsync(driverId);

        return Ok(points);
    }

    [HttpGet("me/point-transactions")]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult<List<PointTransactionModel>>> GetMyPointTransactions(
        [FromQuery] int? orgId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sign = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        if (from is not null && to is not null && from > to)
            return BadRequest("Invalid date range.");

        var pagedResult = await _driversService.GetPointTransactionsByUserIdAsync(
            userId,
            orgId,
            page,
            pageSize,
            sign,
            from,
            to);

        return Ok(pagedResult);
    }

    [HttpGet("{driverId}/point-transactions")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult<PagedResult<PointTransaction>>> GetPointTransactions(
        int driverId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? sign = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null,
        [FromQuery] int? orgId = null)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var targetOrgId = orgId;

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (orgId.HasValue)
                return BadRequest("Sponsors should not specify an org id.");

            targetOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => s.SponsorOrgId).SingleOrDefaultAsync();
            if (!targetOrgId.HasValue)
                return NotFound();
        }

        if (targetOrgId.HasValue && !await IsDriverInOrg(driverId, targetOrgId.Value))
            return NotFound();

        if (from is not null && to is not null && from > to)
            return BadRequest("Invalid date range.");

        var pagedResult = await _driversService.GetPointTransactionsByIdAsync(
            driverId,
            targetOrgId,
            page,
            pageSize,
            sign,
            from,
            to);

        return Ok(pagedResult);
    }

    // TODO: Reduce the db calls here
    [HttpPost("{driverId}/point-transactions")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> CreatePointTransaction(
        int driverId,
        [FromBody] CreatePointTransactionModel request,
        [FromQuery] int? orgId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driver = await _db.DriverUsers.AsNoTracking().Where(d => d.Id == driverId).Include(d => d.User).SingleOrDefaultAsync();
        if (driver is null)
            return NotFound();

        var targetOrgId = orgId;

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (orgId.HasValue)
                return BadRequest("Sponsors should not specify an org id.");

            targetOrgId = await _db.SponsorUsers.AsNoTracking().Where(s => s.UserId == userId).Select(s => s.SponsorOrgId).SingleOrDefaultAsync();
        }

        if (!targetOrgId.HasValue || !await IsDriverInOrg(driverId, targetOrgId.Value))
            return NotFound();

        var org = await _db.SponsorOrgs.AsNoTracking().Where(o => o.Id == targetOrgId).SingleOrDefaultAsync();
        if (org is null)
            return NotFound();

        var transaction = new PointTransaction
        {
            SponsorOrgId = targetOrgId.Value,
            DriverUserId = driverId,
            Reason = request.Reason,
            BalanceChange = request.BalanceChange,
            TransactionDateUtc = DateTime.UtcNow
        };
        _db.PointTransactions.Add(transaction);
        await _db.SaveChangesAsync();
        await _auditLogger.CreatePointTransactionAuditLog(driver.Id, driver.User.Email!, org.Id, org.SponsorName, transaction.BalanceChange, transaction.Reason);

        if (isSponsor)
            await _alertsService.CreatePointTransactionAlert(transaction);

        return Created();
    }
    #endregion

    #region Helpers
    private async Task<bool> IsDriverInSponsorUserOrg(int driverId, string sponsorUserId)
    {
        return await _db.SponsorUsers
            .AsNoTracking()
            .AnyAsync(s =>
                s.UserId == sponsorUserId &&
                _db.DriverUsers.Any(d =>
                    d.Id == driverId &&
                    d.SponsorOrgs.Contains(s.SponsorOrg)));
    }

    private async Task<bool> IsDriverInOrg(int driverId, int orgId)
    {
        return await _db.DriverUsers
            .AsNoTracking()
            .AnyAsync(d =>
                d.Id == driverId &&
                d.SponsorOrgs.Any(o => o.Id == orgId));
    }
    #endregion
}