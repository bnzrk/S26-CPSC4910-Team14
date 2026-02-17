using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Enums;

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
});
AppBuilderExtensions.ConfigureAppCookie(builder);

// DB Connection
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
{
   options.UseMySQL(connectionString);
});

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