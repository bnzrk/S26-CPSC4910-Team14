using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using WebApi.Features.Auth.Models;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Authorization;
using WebApi.Data;

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
            return BadRequest("Invalid email or password.");

        var result = await _signInManager.PasswordSignInAsync(
            user,
            login.Password,
            isPersistent: login.RememberMe,
            lockoutOnFailure: false
        );

        return result.Succeeded ? Ok() : BadRequest("Invalid email or password.");
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
            return Ok(new AuthCredentialsModel
            {
                IsAuthenticated = false,
                User = null
            });
        }

        return Ok(new AuthCredentialsModel
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
