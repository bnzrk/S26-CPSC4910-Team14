using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WebApi.Data.Entities;

namespace WebApi.Data;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // About Info
    public DbSet<AboutInfo> AboutInfos { get; set; }
    public DbSet<TeamMember> TeamMembers { get; set; }
    public DbSet<Feature> Features { get; set; }
    public DbSet<TechStackItem> TechStackItems { get; set; }

    // Users
    public DbSet<AdminUser> AdminUsers { get; set; }
    public DbSet<SponsorUser> SponsorUsers { get; set; }
    public DbSet<DriverUser> DriverUsers { get; set; }

    // Sponsor Orgs
    public DbSet<SponsorOrg> SponsorOrgs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Table relationships
        modelBuilder.Entity<AdminUser>(b =>
        {
            b.HasKey(a => a.UserId);

            b.HasOne(a => a.User)
                .WithOne()
                .HasForeignKey<AdminUser>(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("User");
        });

        modelBuilder.Entity<SponsorUser>(b =>
        {
            b.HasKey(a => a.UserId);

            b.HasOne("WebApi.Data.Entities.SponsorOrg", "SponsorOrg")
                .WithMany("SponsorUsers")
                .HasForeignKey("SponsorOrgId")
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.HasOne(a => a.User)
                .WithOne()
                .HasForeignKey<SponsorUser>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("SponsorOrg");

            b.Navigation("User");
        });

        modelBuilder.Entity<DriverUser>(b =>
        {
            b.HasKey(a => a.UserId);

            b.HasOne(a => a.User)
                .WithOne()
                .HasForeignKey<DriverUser>(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .IsRequired();

            b.Navigation("User");
        });

        // Seeded about info data
        modelBuilder.Entity<AboutInfo>().HasData(new AboutInfo
        {
            Id = 1,
            Team = 14,
            Version = 2,
            ReleaseDateUtc = new DateTime(2026, 2, 11, 0, 0, 0, DateTimeKind.Utc),
            ProductName = "DrivePoints",
            ProductDescription = "A rewards platform where sponsor companies award points to truck drivers for good driving behavior, redeemable for products from a sponsor-managed catalog."
        });

        modelBuilder.Entity<TeamMember>().HasData(
            new TeamMember { Id = 1, AboutInfoId = 1, FirstName = "Ben", LastName = "Nazaruk", Role = "Team Lead", DisplayOrder = 1 },
            new TeamMember { Id = 2, AboutInfoId = 1, FirstName = "Stella", LastName = "Herzberg", Role = "Software Engineer", DisplayOrder = 2 },
            new TeamMember { Id = 3, AboutInfoId = 1, FirstName = "Ella", LastName = "Patel", Role = "Software Engineer", DisplayOrder = 3 },
            new TeamMember { Id = 4, AboutInfoId = 1, FirstName = "Trey", LastName = "Larkins", Role = "Software Engineer", DisplayOrder = 4 }
        );

        modelBuilder.Entity<Feature>().HasData(
            new Feature { Id = 1, AboutInfoId = 1, Title = "Points & Rewards", Description = "Drivers earn points for safe driving behavior, redeemable for real products from sponsor catalogs.", Icon = "trophy", DisplayOrder = 1 },
            new Feature { Id = 2, AboutInfoId = 1, Title = "Sponsor Catalogs", Description = "Each sponsor manages a curated product catalog with real-time pricing from external APIs.", Icon = "store", DisplayOrder = 2 },
            new Feature { Id = 3, AboutInfoId = 1, Title = "Reporting & Analytics", Description = "Comprehensive reports for sponsors and admins — track points, sales, and driver activity.", Icon = "bar-chart-3", DisplayOrder = 3 },
            new Feature { Id = 4, AboutInfoId = 1, Title = "Security & Trust", Description = "Enterprise-grade security with encrypted data, audit logging, and role-based access control.", Icon = "shield-check", DisplayOrder = 4 }
        );

        modelBuilder.Entity<TechStackItem>().HasData(
            new TechStackItem { Id = 1, AboutInfoId = 1, Name = "React 19", Category = "Frontend", DisplayOrder = 1 },
            new TechStackItem { Id = 2, AboutInfoId = 1, Name = "React Router 7", Category = "Frontend", DisplayOrder = 2 },
            new TechStackItem { Id = 3, AboutInfoId = 1, Name = "React Query", Category = "Frontend", DisplayOrder = 3 },
            new TechStackItem { Id = 4, AboutInfoId = 1, Name = "Vite 7", Category = "Frontend", DisplayOrder = 4 },
            new TechStackItem { Id = 5, AboutInfoId = 1, Name = "SCSS Modules", Category = "Frontend", DisplayOrder = 5 },
            new TechStackItem { Id = 6, AboutInfoId = 1, Name = "ASP.NET Core 10", Category = "Backend", DisplayOrder = 1 },
            new TechStackItem { Id = 7, AboutInfoId = 1, Name = "EF Core 10", Category = "Backend", DisplayOrder = 2 },
            new TechStackItem { Id = 8, AboutInfoId = 1, Name = "C# 14", Category = "Backend", DisplayOrder = 3 },
            new TechStackItem { Id = 9, AboutInfoId = 1, Name = "MySQL 8", Category = "Database", DisplayOrder = 1 },
            new TechStackItem { Id = 10, AboutInfoId = 1, Name = "AWS EC2", Category = "Cloud", DisplayOrder = 1 },
            new TechStackItem { Id = 11, AboutInfoId = 1, Name = "GitHub Actions", Category = "CI/CD", DisplayOrder = 1 }
        );
    }
}
