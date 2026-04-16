using Microsoft.AspNetCore.Mvc;
using WebApi.Features.AdminUsers.Models;
using Microsoft.AspNetCore.Authorization;
using WebApi.Features.Users;

namespace WebApi.Features.AdminUsers;

[ApiController]
[Route("/admins")]
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

    // Create Admin
    [HttpPost]
    public async Task<ActionResult> CreateAdminUser(CreateAdminUserModel request)
    {
        var result = await _userService.CreateAdminUser(
            request.Email,
            request.Password,
            request.FirstName,
            request.LastName
        );

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description).ToArray()
            });
        }

        return Created();
    }

    // update user (matches React PUT /admin/users/{id})
    [HttpPut("/admin/users/{userId}")]
    public async Task<ActionResult> UpdateUser(string userId, UpdateUserModel request)
    {
        var result = await _userService.UpdateUserAsync(
            userId,
            request.Email,
            request.FirstName,
            request.LastName
        );

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description).ToArray()
            });
        }

        return NoContent();
    }

    // Password change
    // (matches React POST /admin/users/{id}/password)
    [HttpPost("/admin/users/{userId}/password")]
    public async Task<ActionResult> ChangePassword(string userId, ChangePasswordModel request)
    {
        var result = await _userService.ChangeUserPasswordAsync(
            userId,
            request.Password
        );

        if (!result.Succeeded)
        {
            return BadRequest(new
            {
                Errors = result.Errors.Select(e => e.Description).ToArray()
            });
        }

        return NoContent();
    }
}