using Microsoft.EntityFrameworkCore;
using WebApi.Data.Entities.Audit;

namespace WebApi.Data;

public class AuditDbContext : DbContext
{
    public AuditDbContext(DbContextOptions<AuditDbContext> options) : base(options)
    {
    }

    // Audit Logs
    public DbSet<LoginAuditLog> LoginAuditLogs { get; set; }
    public DbSet<PasswordChangeAuditLog> PasswordChangeAuditLogs { get; set; }
    public DbSet<DriverSponsorChangeAuditLog> DriverSponsorChangeAuditLogs { get; set; }
    public DbSet<PointTransactionAuditLog> PointTransactionAuditLogs { get; set; }
}
