using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;

namespace WebApi.Features.Audit;

[ApiController]
[Route("/audit-logs")]
[Authorize]

public class AuditLogsController : ControllerBase
{
    private readonly AuditDbContext _auditDb;
    private readonly UserManager<User> _userManager;
    private readonly AppDbContext _db;

    public AuditLogsController(AuditDbContext auditDb, UserManager<User> userManager, AppDbContext db)
    {
        _auditDb = auditDb;
        _userManager = userManager;
        _db = db;
    }

    // Helper to allow permissions for sponsors and admin users to access logs
    private bool IsAdminOrSponsor()
    {
        var userTypeClaim = User.FindFirst("userType")?.Value;

        return userTypeClaim == "Admin" || userTypeClaim == "Sponsor";
    }

    // Helper to get sponsor org ID for current user
    private async Task<int?> GetSponsorOrgId()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null || user.UserType != UserType.Sponsor) return null;

        return await _db.SponsorUsers
            .Where(s => s.UserId == user.Id)
            .Select(s => s.SponsorOrgId)
            .SingleOrDefaultAsync();
    }

    [HttpGet("logins")]
    public async Task<IActionResult> GetLoginLogs([FromQuery] string? email, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        if (!IsAdminOrSponsor())
            return Forbid();

        var query = _auditDb.LoginAuditLogs.AsNoTracking();

        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.OrgId == sponsorOrgId.Value);

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.Email.Contains(email));
        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var logs = await query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new
            {
                l.Id,
                l.TimestampUtc,
                l.Email,
                l.Successful,
                Type = "Login"
            })
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("point-transactions")]
    public async Task<IActionResult> GetPointTransactionLogs([FromQuery] string? email, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {

        if (!IsAdminOrSponsor())
            return Forbid();

        var query = _auditDb.PointTransactionAuditLogs.AsNoTracking();

        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.DriverEmail.Contains(email) || l.ActorUserEmail.Contains(email));
        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var logs = await query
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
            })
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("driver-sponsor-changes")]
    public async Task<IActionResult> GetDriverSponsorChangeLogs([FromQuery] string? email, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        if (!IsAdminOrSponsor())
            return Forbid();

        var query = _auditDb.DriverSponsorChangeAuditLogs.AsNoTracking();

        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.DriverEmail.Contains(email) || l.ActorUserEmail.Contains(email));
        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var logs = await query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new
            {
                l.Id,
                l.TimestampUtc,
                l.ActorUserEmail,
                l.DriverEmail,
                l.SponsorOrgName,
                ChangeType = l.ChangeType.ToString(),
                Type = "DriverSponsorChange"
            })
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("password-changes")]
    public async Task<IActionResult> GetPasswordChangeLogs([FromQuery] string? email, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        if (!IsAdminOrSponsor())
            return Forbid();

        var query = _auditDb.PasswordChangeAuditLogs.AsNoTracking();

        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.OrgId == sponsorOrgId.Value);

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.Email.Contains(email));
        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var logs = await query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new
            {
                l.Id,
                l.TimestampUtc,
                l.Email,
                ChangeType = l.ChangeType.ToString(),
                l.Successful,
                Type = "PasswordChange"
            })
            .ToListAsync();

        return Ok(logs);
    }

    [HttpGet("catalog-changes")]
    public async Task<IActionResult> GetCatalogChangeLogs([FromQuery] string? email, [FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        if (!IsAdminOrSponsor())
            return Forbid();

        var query = _auditDb.CatalogChangeAuditLogs.AsNoTracking();

        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);

        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.ActorUserEmail.Contains(email));
        if (from.HasValue)
            query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue)
            query = query.Where(l => l.TimestampUtc <= to.Value);

        var logs = await query
            .OrderByDescending(l => l.TimestampUtc)
            .Select(l => new
            {
                l.Id,
                l.TimestampUtc,
                l.ActorUserEmail,
                l.SponsorOrgId,
                l.ChangeType,
                l.ExternalItemId,
                Type = "CatalogChange"
            })
            .ToListAsync();

        return Ok(logs);
    }
}