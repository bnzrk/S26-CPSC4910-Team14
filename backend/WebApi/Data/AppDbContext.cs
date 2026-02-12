using Microsoft.EntityFrameworkCore;
using WebApi.Data.Entities;

namespace WebApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<AboutInfo> AboutInfos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<AboutInfo>().HasData(new AboutInfo
        {
            Id = 1,
            Team = 14,
            Version = 2,
            ReleaseDateUtc = new DateTime(2026, 2, 11, 0, 0, 0, DateTimeKind.Utc),
            ProductName = "Good Driver Incentive Program",
            ProductDescription = "A rewards platform where sponsor companies award points to truck drivers for good driving behavior, redeemable for products from a sponsor-managed catalog."
        });
    }
}