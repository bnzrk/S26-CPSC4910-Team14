// This is just where we configure things for our app. You don't really need to 
// worry about this 99% of the time once its set up.
using Microsoft.EntityFrameworkCore;
using WebApi.Data;

var builder = WebApplication.CreateBuilder(args);
var frotendCorsPolicyName = "FrontendCors";
var localCorsPolicyName = "LocalCors";
var connectionString = builder.Configuration.GetConnectionString("Default");

builder.Services.AddControllers();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
   options.AddPolicy(frotendCorsPolicyName, policy =>
   {
      policy
      .WithOrigins("http://team14.cpsc4911.com")
      .AllowAnyHeader()
      .AllowAnyMethod();
   });
   options.AddPolicy(localCorsPolicyName, policy =>
   {
      policy
      .WithOrigins("http://localhost:5173")
      .AllowAnyHeader()
      .AllowAnyMethod();
   });
});
builder.Services.AddDbContext<AppDbContext>(options =>
{
   if (builder.Environment.IsDevelopment())
   {
      options.UseSqlite(connectionString);
   }
   else
   {
      options.UseMySQL(connectionString);
   }
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
app.MapControllers();

app.Run();