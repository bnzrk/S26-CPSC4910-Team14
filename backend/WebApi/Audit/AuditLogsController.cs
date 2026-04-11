using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Audit.Models;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Helpers.Pagination;

namespace WebApi.Features.Audit;

[ApiController]
[Route("/audit-logs")]
[Authorize(Policy = PolicyNames.AdminOnly)]
public class AuditLogsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;

    public AuditLogsController(AppDbContext db, UserManager<User> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpGet("logins")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> GetLoginLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var query = _db.LoginAuditLogs.AsNoTracking();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var sponsorOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (!sponsorOrgId.HasValue)
                return BadRequest("Could not resolve user's organization.");

            // Filter logs for sponsor users and driver users in this sponsor's
            query = query.Where(l =>
                _db.SponsorUsers.Any(su => su.UserId == l.UserId && su.SponsorOrgId == sponsorOrgId) ||
                _db.DriverUsers.Any(du => du.UserId == l.UserId && du.SponsorOrgs.Any(so => so.Id == sponsorOrgId)));
        }

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.Email.Contains(email));

        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var pageQuery = query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new LoginLogModel
            {
                Id = l.Id,
                TimestampUtc = l.TimestampUtc,
                Email = l.Email,
                Successful = l.Successful
            });

        var logsResult = await PagedResult.ToPagedResultAsync(pageQuery, page, pageSize);
        return Ok(logsResult);
    }

    [HttpGet("point-transactions")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> GetPointTransactionLogs(
        [FromQuery] string? email,
        [FromQuery] int? sponsorOrgId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = _userManager.GetUserId(User);

        var query = _db.PointTransactionAuditLogs.AsNoTracking();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (sponsorOrgId.HasValue)
                return BadRequest("Sponsors should not specify an organization.");

            sponsorOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (!sponsorOrgId.HasValue)
                return BadRequest("Could not resolve user's organization.");
        }

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.DriverEmail.Contains(email) || l.ActorUserEmail.Contains(email));

        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);

        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var pageQuery = query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new
            {
                l.Id,
                l.TimestampUtc,
                l.ActorUserEmail,
                l.DriverEmail,
                l.SponsorOrgName,
                l.BalanceChange,
                l.Reason,
                Type = "PointTransaction"
            });

        var logsResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);
        return Ok(logsResult);
    }

    [HttpGet("driver-sponsor-changes")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> GetDriverSponsorChangeLogs(
        [FromQuery] string? email,
        [FromQuery] int? sponsorOrgId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var query = _db.DriverSponsorChangeAuditLogs.AsNoTracking();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (sponsorOrgId.HasValue)
                return BadRequest("Sponsors should not specify an organization.");

            sponsorOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (!sponsorOrgId.HasValue)
                return BadRequest("Could not resolve user's organization.");
        }

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.DriverEmail.Contains(email) || l.ActorUserEmail.Contains(email));

        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);

        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var pageQuery = query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new SponsorChangeLogModel
            {
                Id = l.Id,
                TimestampUtc = l.TimestampUtc,
                ActorUserEmail = l.ActorUserEmail,
                DriverEmail = l.DriverEmail,
                SponsorOrgName = l.SponsorOrgName,
                ChangeType = Enum.GetName(l.ChangeType) ?? "N/A"
            });

        var logsResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);
        return Ok(logsResult);
    }

    [HttpGet("password-changes")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> GetPasswordChangeLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var query = _db.PasswordChangeAuditLogs.AsNoTracking();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var sponsorOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (!sponsorOrgId.HasValue)
                return BadRequest("Could not resolve user's organization.");

            query = query = query.Where(l =>
                _db.SponsorUsers.Any(su => su.UserId == l.TargetUserId && su.SponsorOrgId == sponsorOrgId) ||
                _db.DriverUsers.Any(du => du.UserId == l.TargetUserId && du.SponsorOrgs.Any(so => so.Id == sponsorOrgId)));
        }

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.TargetUserEmail.Contains(email));

        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var pageQuery = query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new
            {
                l.Id,
                l.TimestampUtc,
                l.TargetUserEmail,
                ChangeType = Enum.GetName(l.ChangeType),
                l.Successful
            });

        var logsResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);
        return Ok(logsResult);
    }

    [HttpGet("catalog-changes")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<IActionResult> GetCatalogChangeLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var query = _db.CatalogChangeAuditLogs.AsNoTracking();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var sponsorOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (!sponsorOrgId.HasValue)
                return BadRequest("Could not resolve user's organization.");

            query = query.Where(l => l.SponsorOrgId == sponsorOrgId);
        }

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.ActorUserEmail.Contains(email));

        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);

        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var pageQuery = query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new
            {
                l.Id,
                l.TimestampUtc,
                l.ActorUserEmail,
                l.SponsorOrgId,
                l.ChangeType,
                l.ExternalItemId
            });

        var logsResult = await PagedResult.ToPagedResultAsync(query, page, pageSize);
        return Ok(logsResult);
    }
}
