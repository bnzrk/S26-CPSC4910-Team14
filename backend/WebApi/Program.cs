// This is just where we configure things for our app. You don't really need to 
// worry about this 99% of the time once its set up.
var builder = WebApplication.CreateBuilder(args);
var frotendCorsPolicyName = "FrontendCors";
var localCorsPolicyName = "LocalCors";

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

var app = builder.Build();

// Setup for development environment only.
if (app.Environment.IsDevelopment())
{
    // This automatically builds Api documentation from our controller endpoints.
    // You can view it at /swagger.
    app.UseSwagger();
    app.UseSwaggerUI();
    // Lets us recieve requests from our frotnend when developing locally.
    app.UseCors(localCorsPolicyName);
}
// Lets us recieve requests from our frotend when its deployed.
app.UseCors(frotendCorsPolicyName);
app.UseHttpsRedirection();
app.MapControllers();

app.Run();