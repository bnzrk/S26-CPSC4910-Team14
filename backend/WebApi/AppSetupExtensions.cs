using Microsoft.AspNetCore.Identity;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Data;

public static class AppSetupExtensions
{
    // Creates a default admin user if one doesn't exist.
    public static async Task SeedDefaultAdmin(IServiceProvider services, IConfiguration config)
    {
        var defaultAdminConfig = config.GetSection("DefaultAdmin");
        var email = defaultAdminConfig["Email"];
        var password = defaultAdminConfig["Password"];
        var firstName = defaultAdminConfig["FirstName"] ?? "";
        var lastName = defaultAdminConfig["LastName"] ?? "";

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return;

        using var scope = services.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new User
            {
                UserName = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                IsActive = true,
                EmailConfirmed = true
            };

            var createResult = await userManager.CreateAsync(user, password);
            if (!createResult.Succeeded)
            {
                throw new InvalidOperationException($"Failed to create admin user: " +
                                                    string.Join(", ", createResult.Errors.Select(e => e.Description)));
            }
            else
            {
                var roleResult = await userManager.AddToRoleAsync(user, UserTypeRoles.Role(UserType.Admin));
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var admin = new AdminUser
                {
                    UserId = user.Id,
                    User = user
                };
                db.AdminUsers.Add(admin);
                db.SaveChanges();
            }
        }
    }

    // Creates a user role for each user type.
    public static async Task CreateUserRoles(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        foreach (var name in Enum.GetNames(typeof(UserType)))
        {
            if (!await roleManager.RoleExistsAsync(name))
            {
                await roleManager.CreateAsync(new IdentityRole(name));
            }
        }
    }
}