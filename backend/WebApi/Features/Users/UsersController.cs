using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using WebApi.Data.Entities;
using Microsoft.AspNetCore.Authorization;

namespace WebApi.Features.Auth;

[ApiController]
[Route("/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;

    public UsersController(AppDbContext db, UserManager<User> userManager, SignInManager<User> signInManager)
    {
        _db = db;
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("deactivate/{userId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> DeactivateUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound();

        user.IsActive = false;
        _db.SaveChanges();

        var currentUserId = _userManager.GetUserId(User);
        if (currentUserId == userId)
        {
            await _signInManager.SignOutAsync();
        }

        return Ok();
    }

    [HttpPost("activate/{userId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> ActivateUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return NotFound();

        user.IsActive = true;
        _db.SaveChanges();

        return Ok();
    }
}
