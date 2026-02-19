using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Authorization;
using WebApi.Features.DriverUsers.Models;
using WebApi.Features.Users;

namespace WebApi.Features.DriverUsers;

[ApiController]
[Route("/users/drivers")]
public class AdminUsersController : ControllerBase
{
    private readonly IUsersService _usersService;

    public AdminUsersController(IUsersService usersService)
    {
        _usersService = usersService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult> RegisterDriverUser(RegisterDriverUserModel request)
    {
        var result = await _usersService.CreateDriverUser(request.Email, request.Password, request.FirstName, request.LastName);
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
