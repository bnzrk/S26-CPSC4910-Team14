using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Features.SponsorOrgs.Models;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApi.Helpers.Pagination;
using WebApi.Features.Users;
using WebApi.Features.DriverUsers.Models;
using WebApi.Audit;
using WebApi.Features.Alerts;

namespace WebApi.Features.SponsorOrgs;

[ApiController]
[Route("/sponsor-orgs")]
public class SponsorOrgsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly IUsersService _usersService;
    private readonly IAuditLogger _auditLogger;
    private readonly IAlertsService _alertsService;

    public SponsorOrgsController(AppDbContext db, UserManager<User> userManager, IUsersService usersService, IAuditLogger auditLogger, IAlertsService alertsService)
    {
        _db = db;
        _userManager = userManager;
        _usersService = usersService;
        _auditLogger = auditLogger;
        _alertsService = alertsService;
    }

    #region Org
    [HttpGet("available")]
    [Authorize]
    public async Task<ActionResult> GetAvailableOrgs()
    {
        var orgs = await _db.SponsorOrgs
            .AsNoTracking()
            .Select(o => new SimpleSponsorOrgModel
            {
               Id = o.Id,
               Name = o.SponsorName 
            })
            .ToListAsync();

        return Ok(orgs);
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<IActionResult> GetAllSponsorOrgs()
    {
        var orgModels = await _db.SponsorOrgs
            .AsNoTracking()
            .Select(o => new SponsorOrgInfoModel
            {
                Id = o.Id,
                SponsorName = o.SponsorName,
                DateJoined = o.DateJoined,
                SponsorCount = o.SponsorUsers.Count(),
                DriverCount = o.DriverUsers.Count(),
                PointRatio = o.PointRatio
            })
            .ToListAsync();

        return Ok(orgModels);
    }

    [HttpGet("{orgId}")]
    [HttpGet("me")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult<SponsorOrgModel>> Get(int? orgId)
    {
        var resolvedOrgId = await GetCurrentSponsorOrgId();

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot access organization you are not a sponsor for.");
            }
        }

        resolvedOrgId = resolvedOrgId ?? orgId;
        // Try to resolve an org id for the currently logged in user.
        if (resolvedOrgId is null)
            return BadRequest("Could not resolve sponor organization.");

        var orgModel = await _db.SponsorOrgs
            .AsNoTracking()
            .Where(o => o.Id == resolvedOrgId)
            .Select(o => new SponsorOrgInfoModel
            {
                Id = o.Id,
                DateJoined = o.DateJoined,
                SponsorName = o.SponsorName,
                SponsorCount = o.SponsorUsers.Count(),
                DriverCount = o.DriverUsers.Count(),
                PointRatio = o.PointRatio
            })
            .FirstOrDefaultAsync();

        return Ok(orgModel);
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> CreateSponsorOrg(CreateSponsorOrgModel request)
    {
        var org = new SponsorOrg
        {
            SponsorName = request.SponsorName,
            DateJoined = DateTime.UtcNow
        };
        if (request.PointRatio == 0m)
            return BadRequest("Cannot have a point conversion value of 0.");
        if (request.PointRatio is not null)
            org.PointRatio = request.PointRatio.Value;

        org.Catalog = new Catalog();

        _db.SponsorOrgs.Add(org);
        _db.SaveChanges();

        return Created();
    }

    [HttpPatch("{orgId}")]
    [HttpPatch("me")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> UpdateOrg(int? orgId, [FromBody] UpdateSponsorOrgModel request)
    {
        var resolvedOrgId = await GetCurrentSponsorOrgId();

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot edit an organization you are not a sponsor for.");
            }
        }

        resolvedOrgId = resolvedOrgId ?? orgId;
        // Try to resolve an org id for the currently logged in user.
        if (resolvedOrgId is null)
            return BadRequest("Could not resolve sponor organization.");

        var org = await _db.SponsorOrgs.Where(o => o.Id == resolvedOrgId).FirstOrDefaultAsync();
        if (org is null)
            return BadRequest("Invalid organization.");

        if (request.SponsorName is not null)
            org.SponsorName = request.SponsorName;
        if (request.PointRatio is not null)
        {
            if (request.PointRatio == 0m || request.PointRatio < 0m)
                return BadRequest("Invalid point value.");
            org.PointRatio = request.PointRatio.Value;
        }
        await _db.SaveChangesAsync();

        return Ok();
    }
    #endregion

    #region Drivers
    [HttpGet("{orgId}/drivers")]
    [HttpGet("me/drivers")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult<PagedResult<DriverModel>>> GetDrivers(int? orgId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var targetOrgId = orgId;

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (orgId.HasValue)
                return BadRequest("Sponsors should use /me instead of an org id.");

            targetOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => s.SponsorOrgId).SingleOrDefaultAsync();
        }
        if (!targetOrgId.HasValue)
            return NotFound();

        var query = _db.SponsorOrgs
            .AsNoTracking()
            .Where(s => s.Id == targetOrgId.Value)
            .SelectMany(s => s.DriverUsers)
            .Select(d => new DriverModel
            {
                Id = d.Id,
                UserId = d.User.Id,
                Email = d.User.Email!,
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                Points = d.PointTransactions
                    .Where(p => p.SponsorOrgId == targetOrgId)
                    .OrderByDescending(p => p.TransactionDateUtc)
                    .Sum(p => p.BalanceChange),
                DateCreatedUtc = d.User.CreatedDateUtc,
                LastLoginUtc = d.User.LastLoginUtc
            });

        var pageResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);

        return Ok(pageResult);
    }

    [HttpGet("{orgId}/drivers/{driverId}")]
    [HttpGet("me/drivers/{driverId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult<DriverUserModel?>> GetDriver(int? orgId, int driverId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var targetOrgId = orgId;

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (orgId.HasValue)
                return BadRequest("Sponsors should use /me instead of an org id.");

            targetOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
        }
        if (!targetOrgId.HasValue)
            return NotFound();

        var driverModel = await _db.SponsorOrgs
            .AsNoTracking()
            .Where(s => s.Id == targetOrgId)
            .SelectMany(s => s.DriverUsers)
            .Where(d => d.Id == driverId)
            .Select(d => new DriverModel
            {
                Id = d.Id,
                UserId = d.User.Id,
                Email = d.User.Email!,
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                Points = d.PointTransactions
                    .Where(p => p.SponsorOrgId == targetOrgId.Value)
                    .OrderByDescending(p => p.TransactionDateUtc)
                    .Sum(p => p.BalanceChange),
                DateCreatedUtc = d.User.CreatedDateUtc,
                LastLoginUtc = d.User.LastLoginUtc
            })
            .FirstOrDefaultAsync();

        if (driverModel is null)
            return NotFound();

        return Ok(driverModel);
    }

    [HttpPost("{orgId}/drivers/{driverId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> AddDriverToOrg(int orgId, int driverId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driver = await _db.DriverUsers
            .Include(d => d.User)
            .Include(d => d.SponsorOrgs)
            .SingleOrDefaultAsync(d => d.Id == driverId);
        if (driver is null)
            return NotFound("Driver does not exist.");

        if (driver.SponsorOrgs.Any(s => s.Id == orgId))
            return BadRequest("Driver is already in this org.");

        var org = await _db.SponsorOrgs.FindAsync(orgId);
        if (org is null)
            return NotFound("Org does not exist.");

        driver.SponsorOrgs.Add(org);
        await _db.SaveChangesAsync();
        await _auditLogger.CreateDriverSponsorChangeAuditLog(driverId, driver.User.Email!, orgId, org.SponsorName, DriverSponsorChangeType.Added);
        await _alertsService.CreateSponsorshipChangeAlert(driverId, orgId, DriverSponsorChangeType.Added);

        return Ok();
    }

    [HttpDelete("{orgId}/drivers/{driverId}")]
    [HttpDelete("me/drivers/{driverId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> RemoveDriverFromOrg(int? orgId, int driverId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var targetOrgId = orgId;

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (orgId.HasValue)
                return BadRequest("Sponsors should use /me instead of an org id.");

            targetOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
        }
        if (!targetOrgId.HasValue)
            return NotFound();

        var driver = await _db.DriverUsers
            .Include(d => d.User)
            .Include(d => d.SponsorOrgs.Where(o => o.Id == targetOrgId))
            .SingleOrDefaultAsync(d => d.Id == driverId);

        if (driver == null)
            return NotFound("Driver does not exist.");

        var org = driver.SponsorOrgs.FirstOrDefault(o => o.Id == targetOrgId.Value);
        if (org == null)
            return NotFound("Driver is not in specified org.");

        driver.SponsorOrgs.Remove(org);
        await _db.SaveChangesAsync();
        await _auditLogger.CreateDriverSponsorChangeAuditLog(driverId, driver.User.Email!, org.Id, org.SponsorName, DriverSponsorChangeType.Removed);
        await _alertsService.CreateSponsorshipChangeAlert(driverId, org.Id, DriverSponsorChangeType.Removed);

        return Ok();    
    }
    #endregion

    #region Points
    [HttpGet("{orgId}/point-rules")]
    [HttpGet("me/point-rules")]
    [Authorize]
    public async Task<ActionResult<List<PointRuleModel>>> GetPointRules(int? orgId)
    {
        var resolvedOrgId = orgId ?? await GetCurrentSponsorOrgId();
        if (resolvedOrgId is null) return BadRequest("Could not resolve sponor organization.");

        var rules = await _db.PointRules
            .Where(p => p.SponsorOrgId == resolvedOrgId)
            .Select(p => new PointRuleModel
            {
                Id = p.Id,
                SponsorOrgId = p.SponsorOrgId,
                Reason = p.Reason,
                BalanceChange = p.BalanceChange
            })
            .ToListAsync();

        return Ok(rules);
    }

    [HttpPost("{orgId}/point-rules")]
    [HttpPost("me/point-rules")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> CreatePointRule(int? orgId, [FromBody] CreatePointRulesModel request)
    {
        // Try to resolve an org id for the currently logged in user.
        var resolvedOrgId = orgId ?? await GetCurrentSponsorOrgId();
        if (resolvedOrgId is null) return BadRequest("Could not resolve sponor organization.");

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot modify rules for an organization you are not a sponsor for.");
            }
        }

        var rule = new PointRule
        {
            SponsorOrgId = resolvedOrgId.Value,
            Reason = request.Reason,
            BalanceChange = request.BalanceChange
        };
        _db.PointRules.Add(rule);
        await _db.SaveChangesAsync();

        return Created();
    }

    [HttpPatch("{orgId}/point-rules/{ruleId}")]
    [HttpPatch("me/point-rules/{ruleId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> UpdatePointRule(int? orgId, int ruleId, [FromBody] UpdatePointRulesModel request)
    {
        // Try to resolve an org id for the currently logged in user.
        var resolvedOrgId = orgId ?? await GetCurrentSponsorOrgId();
        if (resolvedOrgId is null) return BadRequest("Could not resolve sponor organization.");

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot modify rules for an organization you are not a sponsor for.");
            }
        }

        var rule = _db.PointRules.Where(r => r.Id == ruleId && r.SponsorOrgId == resolvedOrgId).FirstOrDefault();
        if (rule is null)
        {
            return NotFound();
        }
        rule.BalanceChange = request.BalanceChange;
        _db.SaveChanges();

        return Ok();
    }

    [HttpDelete("{orgId}/point-rules/{ruleId}")]
    [HttpDelete("me/point-rules/{ruleId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> DeletePointRule(int? orgId, int ruleId)
    {
        // Try to resolve an org id for the currently logged in user.
        var resolvedOrgId = orgId ?? await GetCurrentSponsorOrgId();
        if (resolvedOrgId is null) return BadRequest("Could not resolve sponor organization.");

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot modify rules for an organization you are not a sponsor for.");
            }
        }

        var result = await _db.PointRules.Where(p => p.Id == ruleId && p.SponsorOrgId == resolvedOrgId).ExecuteDeleteAsync();
        if (result < 1)
        {
            return BadRequest();
        }
        _db.SaveChanges();

        return Ok();
    }
    #endregion

    #region Users
    [HttpGet("{orgId}/users")]
    [HttpGet("me/users")]
    public async Task<ActionResult<PagedResult<SponsorUserModel>>> GetOrgUsers(
        int? orgId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var resolvedOrgId = await GetCurrentSponsorOrgId();

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot edit an organization you are not a sponsor for.");
            }
        }

        resolvedOrgId = resolvedOrgId ?? orgId;
        if (resolvedOrgId is null)
            return BadRequest("Could not resolve sponor organization.");

        var query = _db.SponsorUsers
            .AsNoTracking()
            .Include(s => s.User)
            .Where(s => s.SponsorOrgId == resolvedOrgId && s.User.IsActive)
            .Select(s => new SponsorUserModel
            {
                Id = s.Id,
                Email = s.User.Email!,
                FirstName = s.User.FirstName,
                LastName = s.User.LastName,
                DateCreatedUtc = s.User.CreatedDateUtc,
                LastLoginUtc = s.User.LastLoginUtc
            });

        var pageResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);

        return Ok(pageResult);
    }

    [HttpPost("{orgId}/users")]
    [HttpPost("me/users")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> CreateOrgUser(int? orgId, CreateSponsorUserModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var targetOrgId = orgId;
        // If the user making the request is a sponsor, only allow if they are creating another
        // user for their own sponsor.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null)
                return BadRequest("Sponsors should not specify an org id.");

            var currentSponsorOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (currentSponsorOrgId is null)
            {
                return BadRequest("Cannot create a sponsor user for a different organization.");
            }
            targetOrgId = currentSponsorOrgId;
        }
        if (targetOrgId is null)
            return NotFound();

        var result = await _usersService.CreateSponsorUser(request.Email, request.Password, request.FirstName, request.LastName, targetOrgId.Value);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description).ToArray()
            });
        }

        return Created();
    }

    [HttpDelete("{orgId}/users/{userId}")]
    [HttpDelete("me/users/{userId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> RemoveOrgUser(int? orgId, int userId)
    {
        var resolvedOrgId = await GetCurrentSponsorOrgId();

        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
                return BadRequest("Cannot edit an organization you are not a sponsor for.");
        }

        resolvedOrgId = resolvedOrgId ?? orgId;
        if (resolvedOrgId is null)
            return BadRequest("Could not resolve sponsor organization.");

        var sponsorUser = await _db.SponsorUsers
            .Include(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == userId && s.SponsorOrgId == resolvedOrgId);

        if (sponsorUser is null)
            return NotFound();

        sponsorUser.User.IsActive = false;
        await _db.SaveChangesAsync();

        return NoContent();
    }
    #endregion

    private async Task<int?> GetCurrentSponsorOrgId()
    {
        var userId = _userManager.GetUserId(User);
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            return await _db.SponsorUsers
                .AsNoTracking()
                .Where(s => s.UserId == userId)
                .Select(s => (int?)s.SponsorOrgId)
                .FirstOrDefaultAsync();
        }

        return null;
    }
}
