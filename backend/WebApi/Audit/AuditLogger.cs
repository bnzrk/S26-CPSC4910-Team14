using Microsoft.AspNetCore.Identity;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Entities.Audit;
using WebApi.Data.Enums;

namespace WebApi.Audit;

public class AuditLogger : IAuditLogger
{
    private readonly AppDbContext _db;
    private readonly IHttpContextAccessor _http;
    private readonly UserManager<User> _userManager;

    public AuditLogger(AppDbContext db, IHttpContextAccessor http, UserManager<User> userManager)
    {
        _db = db;
        _http = http;
        _userManager = userManager;
    }

    public async Task CreateLoginAuditLog(string? userId, string email, bool successful)
    {
        var log = new LoginAuditLog
        {
            TimestampUtc = DateTime.UtcNow,
            Email = email,
            Successful = successful
        };
        if (userId is not null)
            log.UserId = userId;

        _db.LoginAuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }

    public async Task CreatePasswordChangeAuditLog(string userId, string email, PasswordChangeType type, bool successful)
    {
        var httpUser = _http.HttpContext?.User;
        if (httpUser is null)
            throw new Exception("Could not resolve user from http context.");

        var user = await _userManager.GetUserAsync(httpUser);
        if (user is null)
            throw new Exception("Could not resolve user from http context.");


        var log = new PasswordChangeAuditLog
        {
            ActorUserId = user.Id,
            ActorUserEmail = user.Email!,
            TimestampUtc = DateTime.UtcNow,
            TargetUserId = userId,
            TargetUserEmail = email,
            ChangeType = type,
            Successful = successful
        };

        _db.PasswordChangeAuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }

    public async Task CreateDriverSponsorChangeAuditLog(int driverId, string driverEmail, int orgId, string orgName, DriverSponsorChangeType type)
    {
        var httpUser = _http.HttpContext?.User;
        if (httpUser is null)
            throw new Exception("Could not resolve user from http context.");

        var user = await _userManager.GetUserAsync(httpUser);
        if (user is null)
            throw new Exception("Could not resolve user from http context.");

        var log = new DriverSponsorChangeAuditLog
        {
            ActorUserId = user.Id,
            ActorUserEmail = user.Email!,
            TimestampUtc = DateTime.UtcNow,
            DriverId = driverId,
            DriverEmail = driverEmail,
            SponsorOrgId = orgId,
            SponsorOrgName = orgName,
            ChangeType = type
        };

        _db.DriverSponsorChangeAuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }

    public async Task CreatePointTransactionAuditLog(int driverId, string driverEmail, int orgId, string orgName, int balanceChange, string reason)
    {
        var httpUser = _http.HttpContext?.User;
        if (httpUser is null)
            throw new Exception("Could not resolve user from http context.");

        var user = await _userManager.GetUserAsync(httpUser);
        if (user is null)
            throw new Exception("Could not resolve user from http context.");

        var log = new PointTransactionAuditLog
        {
            TimestampUtc = DateTime.UtcNow,
            ActorUserId = user.Id,
            ActorUserEmail = user.Email!,
            DriverId = driverId,
            DriverEmail = driverEmail,
            SponsorOrgId = orgId,
            SponsorOrgName = orgName,
            BalanceChange = balanceChange,
            Reason = reason
        };

        _db.PointTransactionAuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }
    public async Task CreateApplicationStatusChangeAuditLog(int applicationId, string newStatus, string? rejectionReason)
    {
        var httpUser = _http.HttpContext?.User;
        if (httpUser is null) throw new Exception("Could not resolve user from http context.");
        var user = await _userManager.GetUserAsync(httpUser);
        if (user is null) throw new Exception("Could not resolve user from http context.");

        var log = new ApplicationStatusChangeAuditLog
        {
            TimestampUtc = DateTime.UtcNow,
            ActorUserId = user.Id,
            ActorUserEmail = user.Email!,
            ApplicationId = applicationId,
            NewStatus = newStatus,
            RejectionReason = rejectionReason
        };
        _db.ApplicationStatusChangeAuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }
    public async Task CreateCatalogChangeAuditLog(int sponsorOrgId, string changeType, int externalItemId)
    {
        var httpUser = _http.HttpContext?.User;
        if (httpUser is null) throw new Exception("Could not resolve user from http context.");
        var user = await _userManager.GetUserAsync(httpUser);
        if (user is null) throw new Exception("Could not resolve user from http context.");

        var log = new CatalogChangeAuditLog
        {
            TimestampUtc = DateTime.UtcNow,
            ActorUserId = user.Id,
            ActorUserEmail = user.Email!,
            SponsorOrgId = sponsorOrgId,
            ChangeType = changeType,
            ExternalItemId = externalItemId
        };
        _db.CatalogChangeAuditLogs.Add(log);
        await _db.SaveChangesAsync();
    }
}