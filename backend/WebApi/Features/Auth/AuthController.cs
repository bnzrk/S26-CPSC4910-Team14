using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebApi.Features.Auth.Models;
using Microsoft.AspNetCore.Authorization;

namespace WebApi.Features.Auth;

[ApiController]
[Route("/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register(RegisterModel register)
    {
        var user = new User
        {
            // ASP.NET Identity requires a username by default, so we'll just use the email
            UserName = register.Email,
            Email = register.Email,
            FirstName = register.FirstName,
            LastName = register.LastName,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, register.Password);
        if (!result.Succeeded)
        {
            return Problem(result.Errors.ToString());
        }

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginModel login)
    {
        var user = await _userManager.FindByEmailAsync(login.Email);
        if (user is null)
            return Unauthorized();

        var result = await _signInManager.PasswordSignInAsync(
            user,
            login.Password,
            isPersistent: login.RememberMe,
            lockoutOnFailure: false
        );

        return result.Succeeded ? Ok() : Unauthorized();
    }

    [HttpPost("logout")]
    public async Task<ActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok();
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        if (!User.Identity?.IsAuthenticated ?? true)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            username = User.FindFirstValue(ClaimTypes.Name) ?? User.Identity!.Name
        });
    }
}
