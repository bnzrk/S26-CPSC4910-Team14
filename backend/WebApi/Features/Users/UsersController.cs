using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data.Entities;
using Microsoft.AspNetCore.Authorization;

namespace WebApi.Features.Users;

[ApiController]
[Route("/users")]
public class UsersController : ControllerBase
{
    private readonly IUsersService _usersService;
    private readonly UserManager<User> _userManager;

    public UsersController(UserManager<User> userManager, IUsersService usersService)
    {
        _usersService = usersService;
        _userManager = userManager;
    }

    [HttpPost("deactivate/{userId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> DeactivateUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return BadRequest();

        var success = await _usersService.SetUserActive(user, false);
        if (!success)
        {
            return BadRequest();
        }

        return Ok();
    }

    [HttpPost("activate/{userId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> ActivateUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return BadRequest();

        var success = await _usersService.SetUserActive(user, true);
        if (!success)
        {
            return BadRequest();
        }

        return Ok();
    }

    [HttpDelete("{userId}")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> DeleteUser(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user is null)
            return BadRequest();

        var result = await _usersService.DeleteUser(user);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description).ToArray() 
            });
        }

        return Ok();
    }
}
