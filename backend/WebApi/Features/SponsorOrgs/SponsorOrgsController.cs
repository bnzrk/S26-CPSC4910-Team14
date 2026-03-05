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

namespace WebApi.Features.SponsorOrgs;

[ApiController]
[Route("/sponsor-orgs")]
public class SponsorOrgsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly IUsersService _usersService;

    public SponsorOrgsController(AppDbContext db, UserManager<User> userManager, IUsersService usersService)
    {
        _db = db;
        _userManager = userManager;
        _usersService = usersService;
    }

    #region Org
    [HttpGet("{orgId}")]
    [HttpGet]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> GetSponsorOrgInfo(int? orgId)
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

        _db.SponsorOrgs.Add(org);
        _db.SaveChanges();

        return Ok();
    }

    [HttpPatch("{orgId}")]
    [HttpPatch]
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

        return Ok(request.SponsorName);
    }
    #endregion

    #region Drivers
    [HttpGet("{orgId}/drivers")]
    [HttpGet("drivers")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> GetOrgDrivers(int? orgId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var resolvedOrgId = await GetCurrentSponsorOrgId();

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot view drivers from an organization you are not a sponsor for.");
            }
        }

        resolvedOrgId = resolvedOrgId ?? orgId;
        if (resolvedOrgId is null)
            return BadRequest("Could not resolve sponor organization.");

        var query = _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.SponsorOrgId == resolvedOrgId)
            .Select(d => new DriverModel
            {
                Id = d.Id,
                Email = d.User.Email,
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                Points = d.PointTransactions
                    .Where(p => p.SponsorOrgId == resolvedOrgId)
                    .OrderByDescending(p => p.TransactionDateUtc)
                    .Sum(p => p.BalanceChange),
                DateCreatedUtc = d.User.CreatedDateUtc,
                LastLoginUtc = d.User.LastLoginUtc
            });

        var pageResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);

        return Ok(pageResult);
    }

    [HttpGet("{orgId}/drivers/{driverId}")]
    [HttpGet("drivers/{driverId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> GetOrgDriver(int? orgId, int driverId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var resolvedOrgId = await GetCurrentSponsorOrgId();

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot view drivers from an organization you are not a sponsor for.");
            }
        }

        resolvedOrgId = resolvedOrgId ?? orgId;
        if (resolvedOrgId is null)
            return BadRequest("Could not resolve sponor organization.");

        var driverModel = await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.SponsorOrgId == resolvedOrgId && d.Id == driverId)
            .Select(d => new DriverModel
            {
                Id = d.Id,
                Email = d.User.Email,
                FirstName = d.User.FirstName,
                LastName = d.User.LastName,
                Points = d.PointTransactions
                    .Where(p => p.SponsorOrgId == resolvedOrgId)
                    .OrderByDescending(p => p.TransactionDateUtc)
                    .Sum(p => p.BalanceChange),
                DateCreatedUtc = d.User.CreatedDateUtc,
                LastLoginUtc = d.User.LastLoginUtc
            })
            .FirstOrDefaultAsync();

        if (driverModel is null)
            return NotFound("Driver not found.");

        return Ok(driverModel);
    }

    // Drivers will be added to sponsor orgs through applications later.
    [HttpPost("{orgId}/drivers/{driverId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> AddDriverToOrg(int orgId, int driverId)
    {
        var driver = _db.DriverUsers.Where(d => d.Id == driverId).FirstOrDefault();
        if (driver is null)
        {
            return BadRequest("Driver does not exist.");
        }

        if (driver.SponsorOrgId is not null)
        {
            return BadRequest("Driver already belongs to a sponsor.");
        }

        driver.SponsorOrgId = orgId;
        _db.SaveChanges();

        return Ok();
    }

    [HttpDelete("{orgId}/drivers/{driverId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> RemoveDriverFromOrg(int orgId, int driverId)
    {
        var driver = _db.DriverUsers.Where(d => d.Id == driverId && d.SponsorOrgId == orgId).FirstOrDefault();
        if (driver is null)
        {
            return BadRequest("Invalid driver.");
        }

        driver.SponsorOrgId = null;
        _db.SaveChanges();

        return Ok();
    }
    #endregion

    #region Points
    [HttpGet("{orgId}/point-rules")]
    [HttpGet("point-rules")]
    [Authorize]
    public async Task<IActionResult> GetPointRules(int? orgId)
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
    [HttpPost("point-rules")]
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
        _db.SaveChanges();

        return Ok();
    }

    [HttpPatch("{orgId}/point-rules/{ruleId}")]
    [HttpPatch("point-rules/{ruleId}")]
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
    [HttpDelete("point-rules/{ruleId}")]
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
    [HttpGet("users")]
    public async Task<IActionResult> GetOrgUsers(
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
                Email = s.User.Email,
                FirstName = s.User.FirstName,
                LastName = s.User.LastName,
                DateCreatedUtc = s.User.CreatedDateUtc,
                LastLoginUtc = s.User.LastLoginUtc
            });

        var pageResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);

        return Ok(pageResult);
    }

    [HttpPost("users")]
    [HttpPost("{orgId}/users")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> CreateOrgUser(int? orgId, CreateSponsorUserModel request)
    {
        var resolvedOrgId = await GetCurrentSponsorOrgId();

        // Ensure sponsor aren't trying to edit rules for another org.
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            if (orgId is not null && resolvedOrgId != orgId)
            {
                return BadRequest("Cannot create user for an organization you are not a sponsor for.");
            }
        }

        resolvedOrgId = resolvedOrgId ?? orgId;
        if (resolvedOrgId is null)
            return BadRequest("Could not resolve sponor organization.");

        // Ensure the request sponsor organization exists.
        var requestOrg = _db.SponsorOrgs.Where(s => s.Id == resolvedOrgId).FirstOrDefault();
        if (requestOrg is null)
        {
            return BadRequest("Sponsor organization does not exist.");
        }

        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser is null)
        {
            return Unauthorized("Current user not found.");
        }

        var result = await _usersService.CreateSponsorUser(request.Email, request.Password, request.FirstName, request.LastName, requestOrg);
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
        else if (User.IsInRole(UserTypeRoles.Role(UserType.Driver)))
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
