using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;

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
      .WithOrigins("http://team14.cpsc4911.com")
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
builder.Services.AddAuthorization();

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

app.Run();