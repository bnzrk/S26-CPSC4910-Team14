using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebApi.Data.Entities;

namespace WebApi.Data;

public class AuditDbContext : DbContext
{
    private readonly AppDbContext _appDb;
    private readonly IHttpContextAccessor _http;

    public AuditDbContext(DbContextOptions<AuditDbContext> options, AppDbContext appDb, IHttpContextAccessor http) : base(options)
    {
        _appDb = appDb;
        _http = http;
    }

    public DbSet<LoginAuditLog> LoginAuditLogs { get; set; }
}
