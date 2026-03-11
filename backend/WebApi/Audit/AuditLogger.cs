using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;

namespace WebApi.Audit;

public class AuditLogger : IAuditLogger
{
    private readonly AuditDbContext _auditDb;

    public AuditLogger(AuditDbContext auditDb)
    {
        _auditDb = auditDb;
    }

    public async Task CreateLoginAuditLog(string email, bool successful)
    {
        var log = new LoginAuditLog
        {
            TimestampUtc = DateTime.UtcNow,
            Email = email,
            Successful = successful
        };

        _auditDb.LoginAuditLogs.Add(log);
        await _auditDb.SaveChangesAsync();
    }

    public async Task CreatePasswordChangeAuditLog(string userId, string email, PasswordChangeType type, bool successful)
    {
        var log = new PasswordChangeAuditLog
        {
            TimestampUtc = DateTime.UtcNow,
            UserId = userId,
            Email = email,
            ChangeType = type,
            Successful = successful
        };

        _auditDb.PasswordChangeAuditLogs.Add(log);
        await _auditDb.SaveChangesAsync();
    }
}