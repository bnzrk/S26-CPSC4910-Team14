using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Features.Auth.Models;
using WebApi.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using WebApi.Data;

namespace WebApi.Features.Auth;

[ApiController]
[Route("/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, AppDbContext db)
    {
        _db = db;
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginModel login)
    {
        var user = await _userManager.FindByEmailAsync(login.Email);
        if (user is null || !user.IsActive)
            return BadRequest("Invalid email or password.");

        var result = await _signInManager.PasswordSignInAsync(
            user,
            login.Password,
            isPersistent: login.RememberMe,
            lockoutOnFailure: false
        );
        if (!result.Succeeded)
            return BadRequest("Invalid email or password.");

        user.LastLoginUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok();
    }

    [HttpGet("me")]
    [AllowAnonymous]
    public async Task<ActionResult> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null)
        {
            return Ok(new ProfileModel
            {
                IsAuthenticated = false,
                User = null
            });
        }

        return Ok(new ProfileModel
        {
            IsAuthenticated = true,
            User = new UserModel
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserType = user.UserType.ToString()
            }
        });
    }
}
