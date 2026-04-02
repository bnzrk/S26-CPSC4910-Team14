using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication;
using WebApi.Data.Entities;
using WebApi.Data;

public static class AppBuilderExtensions
{
    // Allow cross site requests with our frontend.
    public static void AddCors(WebApplicationBuilder builder, string devCorsPolicyName, string releaseCorsPolicyName)
    {
        var externalStoreApi = builder.Configuration["ExternalStore:BaseUrl"] ?? "";

        builder.Services.AddCors(options =>
        {
            options.AddPolicy(releaseCorsPolicyName, policy =>
            {
                policy
                .WithOrigins("https://team14.cpsc4911.com", externalStoreApi)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            });
            options.AddPolicy(devCorsPolicyName, policy =>
            {
                policy
                .WithOrigins("http://localhost:5173", externalStoreApi)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            });
        });
    }

    // Adds Asp Identity which handles our users.
    public static void AddIdentity(WebApplicationBuilder builder)
    {
        builder.Services
            .AddIdentityCore<User>(options =>
            {
                // We can set up more password or account requirements here.
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<IdentityRole>()
            .AddEntityFrameworkStores<AppDbContext>()
            .AddSignInManager();
    }

    // Adds cookie authentication for users and requests.
    public static void AddCookieAuthentication(WebApplicationBuilder builder)
    {
        builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddCookie(IdentityConstants.ApplicationScheme, options =>
            {
                options.Cookie.Name = "driverpoints.auth";
                if (builder.Environment.IsDevelopment())
                {
                    // Dev
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.None;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                }
                else
                {
                    // Release
                    options.Cookie.HttpOnly = true;
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                    options.Cookie.SameSite = SameSiteMode.Lax;
                    options.ExpireTimeSpan = TimeSpan.FromDays(14);
                    options.SlidingExpiration = true;
                }
            })
            .AddCookie("Impersonation", options =>
            {
                options.Cookie.Name = "driverpoints.impersonation";
                options.Cookie.HttpOnly = true;
                if (builder.Environment.IsDevelopment())
                {
                    options.Cookie.SecurePolicy = CookieSecurePolicy.None;   
                }
                else
                {
                    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                }
                options.Cookie.SameSite = SameSiteMode.Lax;   
                options.ExpireTimeSpan = TimeSpan.FromHours(2);
                options.Events.OnRedirectToLogin = ctx =>
                {
                    ctx.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };
            });
    }

    // Configures the cookie validation event to logout the user if their account is deactivated.
    public static void ConfigureAppCookie(WebApplicationBuilder builder)
    {
        builder.Services.ConfigureApplicationCookie(options =>
        {
            options.Events.OnValidatePrincipal = async context =>
            {
                if (context.Principal is null)
                    return;

                var userManager = context.HttpContext.RequestServices
                    .GetRequiredService<UserManager<User>>();

                var user = await userManager.GetUserAsync(context.Principal);

                if (user == null || !user.IsActive)
                {
                    context.RejectPrincipal();
                    await context.HttpContext.SignOutAsync();
                }
            };
        });
    }
}