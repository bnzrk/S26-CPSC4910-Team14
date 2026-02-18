using Microsoft.AspNetCore.Identity;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Data;

namespace WebApi.Features.Users;

public class UserService : IUsersService
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;

    public UserService(AppDbContext db, UserManager<User> userManager)
    {
        _db = db;
        _userManager = userManager;
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
            IsActive = true
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
            IsActive = true
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

    public async Task<IdentityResult> CreateDriverUser(string email, string password, string firstName, string lastName)
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
            IsActive = true
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
}