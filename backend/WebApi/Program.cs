using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Enums;
using WebApi.Features.DriverUsers;
using WebApi.Features.Users;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();
builder.Services.AddControllers();
builder.Services.AddSwaggerGen();

var devCorsPolicyName = "LocalCors";
var releaseCorsPolicyName = "ReleaseCors";
AppBuilderExtensions.AddCors(builder, devCorsPolicyName, releaseCorsPolicyName);

AppBuilderExtensions.AddIdentity(builder);
AppBuilderExtensions.AddCookieAuthentication(builder);
builder.Services.AddAuthorization(options =>
{
   options.AddPolicy(PolicyNames.AdminOnly, p => p.RequireRole(UserTypeRoles.Role(UserType.Admin)));
   options.AddPolicy(PolicyNames.AdminOrSponsor, p => p.RequireRole(UserTypeRoles.Role(UserType.Admin), UserTypeRoles.Role(UserType.Sponsor)));
   options.AddPolicy(PolicyNames.SponsorOnly, p => p.RequireRole(UserTypeRoles.Role(UserType.Sponsor)));
   options.AddPolicy(PolicyNames.DriverOnly, p => p.RequireRole(UserTypeRoles.Role(UserType.Driver)));
});
AppBuilderExtensions.ConfigureAppCookie(builder);

// DB Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
   options.UseMySQL(connectionString);
});

// Our services
// .NET handles injecting all other services specified in the constructor for us
builder.Services.AddScoped<IUsersService, UsersService>();
builder.Services.AddScoped<IDriverUsersService, DriverUsersService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
   // This automatically builds Api documentation from our controller endpoints.
   // You can view it at /swagger.
   app.UseSwagger();
   app.UseSwaggerUI();

   app.UseCors(devCorsPolicyName);
}
app.UseCors(releaseCorsPolicyName);
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
await AppSetupExtensions.CreateUserRoles(app.Services);
await AppSetupExtensions.SeedDefaultAdmin(app.Services, app.Configuration);

app.Run();