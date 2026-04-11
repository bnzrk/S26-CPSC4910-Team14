using Microsoft.EntityFrameworkCore;
using WebApi.Data.Entities.Audit;

namespace WebApi.Data;

public class AuditDbContext : DbContext
{
    public AuditDbContext(DbContextOptions<AuditDbContext> options) : base(options)
    {
    }

    // Audit Logs
    
}
