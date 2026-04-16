using Microsoft.AspNetCore.Identity;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Data;
using WebApi.Audit;

namespace WebApi.Features.Users;

public class UsersService : IUsersService
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly IAuditLogger _auditLogger;

    public UsersService(AppDbContext db, UserManager<User> userManager, IAuditLogger auditLogger)
    {
        _db = db;
        _userManager = userManager;
        _auditLogger = auditLogger;
    }

    public async Task<IdentityResult> CreateAdminUser(string email, string password, string firstName, string lastName)
    {
        // We want to abort our changes if something fails before we finish.
        using var transaction = await _db.Database.BeginTransactionAsync();

        var user = new User
        {
            // ASP.NET Identity requires a username by default, so we'll just use the email
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            UserType = UserType.Admin,
            IsActive = true,
            CreatedDateUtc = DateTime.UtcNow
        };

        // Attempt to create the base user.
        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            return createResult;
        }

        var roleResult = await _userManager.AddToRoleAsync(user, UserTypeRoles.Role(UserType.Admin));
        if (!roleResult.Succeeded)
        {
            await transaction.RollbackAsync();
            return roleResult;
        }

        var admin = new AdminUser
        {
            User = user
        };
        _db.AdminUsers.Add(admin);
        await _db.SaveChangesAsync();

        // Commit our changes if successful.
        await transaction.CommitAsync();

        return IdentityResult.Success;
    }

    public async Task<IdentityResult> CreateSponsorUser(string email, string password, string firstName, string lastName, SponsorOrg org)
    {
        // We want to abort our changes if something fails before we finish.
        using var transaction = await _db.Database.BeginTransactionAsync();

        var user = new User
        {
            // ASP.NET Identity requires a username by default, so we'll just use the email
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            UserType = UserType.Sponsor,
            IsActive = true,
            CreatedDateUtc = DateTime.UtcNow
        };

        // Attempt to create the base user.
        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            return createResult;
        }

        var roleResult = await _userManager.AddToRoleAsync(user, UserTypeRoles.Role(UserType.Sponsor));
        if (!roleResult.Succeeded)
        {
            await transaction.RollbackAsync();
            return roleResult;
        }

        var sponsor = new SponsorUser
        {
            User = user,
            SponsorOrg = org
        };
        _db.SponsorUsers.Add(sponsor);
        await _db.SaveChangesAsync();

        // Commit our changes if successful.
        await transaction.CommitAsync();

        return IdentityResult.Success;
    }

    public async Task<IdentityResult> CreateSponsorUser(string email, string password, string firstName, string lastName, int orgId)
    {
        // We want to abort our changes if something fails before we finish.
        using var transaction = await _db.Database.BeginTransactionAsync();

        var user = new User
        {
            // ASP.NET Identity requires a username by default, so we'll just use the email
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            UserType = UserType.Sponsor,
            IsActive = true,
            CreatedDateUtc = DateTime.UtcNow
        };

        // Attempt to create the base user.
        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            return createResult;
        }

        var roleResult = await _userManager.AddToRoleAsync(user, UserTypeRoles.Role(UserType.Sponsor));
        if (!roleResult.Succeeded)
        {
            await transaction.RollbackAsync();
            return roleResult;
        }

        var sponsor = new SponsorUser
        {
            User = user,
            SponsorOrgId = orgId
        };
        _db.SponsorUsers.Add(sponsor);
        await _db.SaveChangesAsync();

        // Commit our changes if successful.
        await transaction.CommitAsync();

        return IdentityResult.Success;
    }

    public async Task<IdentityResult> CreateDriverUser(string email, string password, string firstName, string lastName, SponsorOrg? org = null)
    {
        // We want to abort our changes if something fails before we finish.
        using var transaction = await _db.Database.BeginTransactionAsync();

        var user = new User
        {
            // ASP.NET Identity requires a username by default, so we'll just use the email
            UserName = email,
            Email = email,
            FirstName = firstName,
            LastName = lastName,
            UserType = UserType.Driver,
            IsActive = true,
            CreatedDateUtc = DateTime.UtcNow
        };

        // Attempt to create the base user.
        var createResult = await _userManager.CreateAsync(user, password);
        if (!createResult.Succeeded)
        {
            return createResult;
        }

        var roleResult = await _userManager.AddToRoleAsync(user, UserTypeRoles.Role(UserType.Driver));
        if (!roleResult.Succeeded)
        {
            await transaction.RollbackAsync();
            return roleResult;
        }

        var driver = new DriverUser
        {
            User = user
        };
        _db.DriverUsers.Add(driver);

        if (org is not null)
            driver.SponsorOrgs.Add(org);
        await _db.SaveChangesAsync();

        // Commit our changes if successful.
        await transaction.CommitAsync();

        return IdentityResult.Success;
    }

    public async Task<bool> SetUserActive(User user, bool active)
    {
        user.IsActive = active;
        _db.SaveChanges();

        return true;
    }

    public async Task<IdentityResult> DeleteUser(User user)
    {
        return await _userManager.DeleteAsync(user);
    }

    public async Task<IdentityResult> UpdateUserAsync(string userId, string email, string firstName, string lastName)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) throw new Exception($"User not found.");

        user.FirstName = firstName;
        user.LastName = lastName;
        user.Email = email;
        user.UserName = email;
        user.NormalizedEmail = email.ToUpper();
        user.NormalizedUserName = email.ToUpper();

        var result = await _userManager.UpdateAsync(user);
        return result;
    }

    public async Task<IdentityResult> ChangeUserPasswordAsync(string userId, string newPassword, PasswordChangeType changeType)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null) throw new Exception($"User not found.");

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);
        await _auditLogger.CreatePasswordChangeAuditLog(user.Id, user.Email!, changeType, result.Succeeded);
        return result;
    }
}