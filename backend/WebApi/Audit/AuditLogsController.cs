using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
 
namespace WebApi.Features.Audit;
 
[ApiController]
[Route("/audit-logs")]
[Authorize(Policy = PolicyNames.AdminOnly)]
public class AuditLogsController : ControllerBase
{
    private readonly AuditDbContext _auditDb;
 
    public AuditLogsController(AuditDbContext auditDb)
    {
        _auditDb = auditDb;
    }
 
    [HttpGet("logins")]
    public async Task<IActionResult> GetLoginLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var query = _auditDb.LoginAuditLogs.AsNoTracking();
 
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
    public async Task<IActionResult> GetPointTransactionLogs(
        [FromQuery] string? email,
        [FromQuery] int? sponsorOrgId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var query = _auditDb.PointTransactionAuditLogs.AsNoTracking();
 
        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.DriverEmail.Contains(email) || l.ActorUserEmail.Contains(email));
 
        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);
 
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
    public async Task<IActionResult> GetDriverSponsorChangeLogs(
        [FromQuery] string? email,
        [FromQuery] int? sponsorOrgId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var query = _auditDb.DriverSponsorChangeAuditLogs.AsNoTracking();
 
        if (!string.IsNullOrWhiteSpace(email))
            query = query.Where(l => l.DriverEmail.Contains(email) || l.ActorUserEmail.Contains(email));
 
        if (sponsorOrgId.HasValue)
            query = query.Where(l => l.SponsorOrgId == sponsorOrgId.Value);
 
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
    public async Task<IActionResult> GetPasswordChangeLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var query = _auditDb.PasswordChangeAuditLogs.AsNoTracking();
 
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
    public async Task<IActionResult> GetCatalogChangeLogs(
        [FromQuery] string? email,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to)
    {
        var query = _auditDb.CatalogChangeAuditLogs.AsNoTracking();

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
 