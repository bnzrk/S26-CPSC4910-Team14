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

    private bool IsAdminOrSponsor()
    {
        var userTypeClaim = User.FindFirst("userType")?.Value;
        return userTypeClaim == "Admin" || userTypeClaim == "Sponsor";
    }

    private async Task<int?> GetSponsorOrgId()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null || user.UserType != UserType.Sponsor) return null;

        return await _db.SponsorUsers
            .Where(s => s.UserId == user.Id)
            .Select(s => s.SponsorOrgId)
            .SingleOrDefaultAsync();
    }

    private IQueryable<T> ApplyFilters<T>(IQueryable<T> query, string? email, DateTime? from, DateTime? to, int? sponsorOrgId) where T : class
    {
        return query;
    }

    // Generic method for paginated result
    private async Task<IActionResult> GetPaginatedResult<T>(IQueryable<T> query, int page, int pageSize, Func<T, object> selector)
    {
        var totalCount = await query.CountAsync();
        var data = await query
            .OrderByDescending(e => EF.Property<DateTime>(e, "TimestampUtc"))
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(selector)
            .ToListAsync();

        return Ok(new { logs = data, totalCount, page, pageSize });
    }

    [HttpGet("logins")]
    public async Task<IActionResult> GetLoginLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (!IsAdminOrSponsor()) return Forbid();

        var query = _auditDb.LoginAuditLogs.AsNoTracking();
        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue) query = query.Where(l => l.OrgId == sponsorOrgId.Value);
        if (!string.IsNullOrWhiteSpace(email)) query = query.Where(l => l.Email.Contains(email));
        if (from.HasValue) query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue) query = query.Where(l => l.TimestampUtc <= to.Value);

        return await GetPaginatedResult(query, page, pageSize, l => new
        {
            l.Id,
            l.TimestampUtc,
            l.Email,
            l.Successful,
            Type = "Login"
        });
    }

    [HttpGet("point-transactions")]
    public async Task<IActionResult> GetPointTransactionLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (!IsAdminOrSponsor()) return Forbid();

        var query = _auditDb.PointTransactionAuditLogs.AsNoTracking();
        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue) query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);
        if (!string.IsNullOrWhiteSpace(email)) query = query.Where(l => l.DriverEmail.Contains(email) || l.ActorUserEmail.Contains(email));
        if (from.HasValue) query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue) query = query.Where(l => l.TimestampUtc <= to.Value);

        return await GetPaginatedResult(query, page, pageSize, l => new
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
    }

    [HttpGet("driver-sponsor-changes")]
    public async Task<IActionResult> GetDriverSponsorChangeLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (!IsAdminOrSponsor()) return Forbid();

        var query = _auditDb.DriverSponsorChangeAuditLogs.AsNoTracking();
        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue) query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);
        if (!string.IsNullOrWhiteSpace(email)) query = query.Where(l => l.DriverEmail.Contains(email) || l.ActorUserEmail.Contains(email));
        if (from.HasValue) query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue) query = query.Where(l => l.TimestampUtc <= to.Value);

        return await GetPaginatedResult(query, page, pageSize, l => new
        {
            l.Id,
            l.TimestampUtc,
            l.ActorUserEmail,
            l.DriverEmail,
            l.SponsorOrgName,
            ChangeType = l.ChangeType.ToString(),
            Type = "DriverSponsorChange"
        });
    }

    [HttpGet("password-changes")]
    public async Task<IActionResult> GetPasswordChangeLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (!IsAdminOrSponsor()) return Forbid();

        var query = _auditDb.PasswordChangeAuditLogs.AsNoTracking();
        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue) query = query.Where(l => l.OrgId == sponsorOrgId.Value);
        if (!string.IsNullOrWhiteSpace(email)) query = query.Where(l => l.Email.Contains(email));
        if (from.HasValue) query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue) query = query.Where(l => l.TimestampUtc <= to.Value);

        return await GetPaginatedResult(query, page, pageSize, l => new
        {
            l.Id,
            l.TimestampUtc,
            l.Email,
            ChangeType = l.ChangeType.ToString(),
            l.Successful,
            Type = "PasswordChange"
        });
    }

    [HttpGet("catalog-changes")]
    public async Task<IActionResult> GetCatalogChangeLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        if (!IsAdminOrSponsor()) return Forbid();

        var query = _auditDb.CatalogChangeAuditLogs.AsNoTracking();
        var sponsorOrgId = await GetSponsorOrgId();
        if (sponsorOrgId.HasValue) query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);
        if (!string.IsNullOrWhiteSpace(email)) query = query.Where(l => l.ActorUserEmail.Contains(email));
        if (from.HasValue) query = query.Where(l => l.TimestampUtc >= from.Value);
        if (to.HasValue) query = query.Where(l => l.TimestampUtc <= to.Value);

        return await GetPaginatedResult(query, page, pageSize, l => new
        {
            l.Id,
            l.TimestampUtc,
            l.ActorUserEmail,
            l.SponsorOrgId,
            l.ChangeType,
            l.ExternalItemId,
            Type = "CatalogChange"
        });
    }
}