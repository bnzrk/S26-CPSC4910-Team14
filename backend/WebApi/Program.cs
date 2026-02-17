using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

// Cors
var frotendCorsPolicyName = "FrontendCors";
var localCorsPolicyName = "LocalCors";
builder.Services.AddCors(options =>
{
   options.AddPolicy(frotendCorsPolicyName, policy =>
   {
      policy
      .WithOrigins("https://team14.cpsc4911.com")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
   });
   options.AddPolicy(localCorsPolicyName, policy =>
   {
      policy
      .WithOrigins("http://localhost:5173")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
   });
});

// Asp Identity
builder.Services
   .AddIdentityCore<User>(options =>
   {
      options.User.RequireUniqueEmail = true;
   })
   .AddRoles<IdentityRole>()
   .AddEntityFrameworkStores<AppDbContext>()
   .AddSignInManager();

// Cookie auth
builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme)
    .AddCookie(IdentityConstants.ApplicationScheme, options =>
    {
        options.Cookie.Name = "driverpoints.auth";
        if (builder.Environment.IsDevelopment())
        {
            // Dev
            options.Cookie.SecurePolicy = CookieSecurePolicy.None;
            options.Cookie.SameSite = SameSiteMode.None;
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
    });
builder.Services.AddAuthorization(options =>
{
   options.AddPolicy(PolicyNames.AdminOnly, p => p.RequireRole(UserTypeRoles.Role(UserType.Admin)));
   options.AddPolicy(PolicyNames.AdminOrSponsor, p => p.RequireRole(UserTypeRoles.Role(UserType.Admin), UserTypeRoles.Role(UserType.Sponsor)));
});
// This forces a user to sign out if their account is inactive
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnValidatePrincipal = async context =>
    {
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

// DB Connection
builder.Configuration.AddEnvironmentVariables();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
   options.UseMySQL(connectionString);
});

var app = builder.Build();

// Setup for development environment only.
if (app.Environment.IsDevelopment())
{
   // This automatically builds Api documentation from our controller endpoints.
   // You can view it at /swagger.
   app.UseSwagger();
   app.UseSwaggerUI();
   // Lets us recieve requests from our frotnend when developing locally.
   if (app.Environment.IsDevelopment())
   {
      app.UseCors(localCorsPolicyName);
   }
   else
   {
      app.UseCors(frotendCorsPolicyName);
   }
}
// Lets us recieve requests from our frotend when its deployed.
app.UseCors(frotendCorsPolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
// Create roles from user types
await AppSetupExtensions.CreateUserRoles(app.Services);
// Seed an admin user
await AppSetupExtensions.SeedDefaultAdmin(app.Services, app.Configuration);

app.Run();