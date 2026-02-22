using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Features.SponsorOrgs.Models;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Features.SponsorOrgs;

[ApiController]
[Route("/sponsor-orgs")]
public class SponsorOrgsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;

    public SponsorOrgsController(AppDbContext db, UserManager<User> userManager)
    {
        _db = db;
        _userManager = userManager;
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
        _db.SponsorOrgs.Add(org);
        _db.SaveChanges();

        return Ok();
    }

    #region Drivers
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
    [Authorize]
    public async Task<IActionResult> CreatePointRule(int orgId)
    {
        var rules = await _db.PointRules
            .Where(p => p.SponsorOrgId == orgId)
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
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> CreatePointRule(int orgId, [FromBody] CreatePointRulesModel request)
    {
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            var userId = _userManager.GetUserId(User);
            var sponsor = await _db.SponsorUsers.Where(s => s.UserId == userId).FirstOrDefaultAsync();
            if (sponsor is null || sponsor.SponsorOrgId != orgId)
            {
                return BadRequest("Cannot modify rules for an organization you are not a sponsor for.");
            }
        }

        var rule = new PointRule
        {
            SponsorOrgId = orgId,
            Reason = request.Reason,
            BalanceChange = request.BalanceChange
        };
        _db.PointRules.Add(rule);
        _db.SaveChanges();

        return Ok();
    }

    [HttpDelete("{orgId}/point-rules/{ruleId}")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> DeletePointRule(int orgId, int ruleId)
    {
        if (User.IsInRole(UserTypeRoles.Role(UserType.Sponsor)))
        {
            var userId = _userManager.GetUserId(User);
            var sponsor = await _db.SponsorUsers.Where(s => s.UserId == userId).FirstOrDefaultAsync();
            if (sponsor is null || sponsor.SponsorOrgId != orgId)
            {
                return BadRequest("Cannot modify rules for an organization you are not a sponsor for.");
            }
        }

        var result = await _db.PointRules.Where(p => p.Id == ruleId && p.SponsorOrgId == orgId).ExecuteDeleteAsync();
        if (result < 1)
        {
            return BadRequest();
        }
        _db.SaveChanges();

        return Ok();
    }
    #endregion
}
