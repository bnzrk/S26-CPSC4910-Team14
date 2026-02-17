using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebApi.Features.Auth.Models;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Authorization;

namespace WebApi.Features.Auth;

[ApiController]
[Route("/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public AuthController(UserManager<User> userManager, SignInManager<User> signInManager, IAuthorizationService authService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginModel login)
    {
        var user = await _userManager.FindByEmailAsync(login.Email);
        if (user is null || !user.IsActive)
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
    [Authorize]
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
            email = User.FindFirstValue(ClaimTypes.Name) ?? User.Identity!.Name
        });
    }
}
