using Microsoft.AspNetCore.Identity;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Features.Users;

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
        var userService = scope.ServiceProvider.GetRequiredService<IUsersService>();

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            var result = await userService.CreateAdminUser(email, password, firstName, lastName);
            if (!result.Succeeded)
            {
                Console.WriteLine($"Failed to create admin user: " +
                                                    string.Join(", ", result.Errors.ToArray().Select(e => e.Description)));
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