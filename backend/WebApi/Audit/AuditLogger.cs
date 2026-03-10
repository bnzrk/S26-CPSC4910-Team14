using WebApi.Data;
using WebApi.Data.Entities;

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
}