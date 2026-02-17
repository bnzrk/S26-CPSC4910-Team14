using Microsoft.AspNetCore.Mvc;
using WebApi.Features.AdminUsers.Models;
using Microsoft.AspNetCore.Authorization;
using WebApi.Features.Users;

namespace WebApi.Features.AdminUsers;

[ApiController]
[Route("/users/admins")]
public class AdminUsersController : ControllerBase
{
    private readonly IUsersService _userService;

    public AdminUsersController(IUsersService userService)
    {
        _userService = userService;
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> CreateAdminUser(CreateAdminUserModel request)
    {
        var result = await _userService.CreateAdminUser(request.Email, request.Password, request.FirstName, request.LastName);
        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description).ToArray() 
            });
        }

        return Created();
    }
}
