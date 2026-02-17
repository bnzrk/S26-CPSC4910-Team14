using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using WebApi.Features.Auth.Models;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Authorization;

namespace WebApi.Features.Auth;

[ApiController]
[Route("/users/admins")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IAuthorizationService _authService;

    public AdminUsersController(AppDbContext db, UserManager<User> userManager, SignInManager<User> signInManager, IAuthorizationService authService)
    {
        _db = db;
        _userManager = userManager;
        _signInManager = signInManager;
        _authService = authService;
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> CreateAdminUser(CreateAdminUserModel request)
    {
        var user = new User
        {
            // ASP.NET Identity requires a username by default, so we'll just use the email
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            UserType = UserType.Admin,
            IsActive = true
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            return Problem("Failed to create user.");
        }

        var roleResult = await _userManager.AddToRoleAsync(user, UserTypeRoles.Role(UserType.Admin));
        if (!roleResult.Succeeded)
        {
            await _userManager.DeleteAsync(user);
            return Problem("Failed to apply necessary roles to user.");
        }

        var admin = new AdminUser
        {
            User = user
        };
        _db.AdminUsers.Add(admin);

        return Created();
    }

    [HttpDelete("{userId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> DeleteAdminUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null || user.UserType != UserType.Admin)
            return NotFound();

        var deleteResult = await _userManager.DeleteAsync(user);
        if (!deleteResult.Succeeded)
        {
            return Problem("Failed to delete user.");
        }

        return Ok();
    }
}
