using Microsoft.AspNetCore.Mvc;
using WebApi.Features.AdminUsers.Models;
using Microsoft.AspNetCore.Authorization;
using WebApi.Features.Users;
using WebApi.Data.Enums;

namespace WebApi.Features.AdminUsers;

[ApiController]
[Authorize(Policy = PolicyNames.AdminOnly)]
[Route("/admins")]
public class AdminUsersController : ControllerBase
{
    private readonly IUsersService _userService;

    public AdminUsersController(IUsersService userService)
    {
        _userService = userService;
    }

    [HttpPost]
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

    // update user (matches React PUT /admin/users/{id})
    [HttpPut("/admin/users/{userId}")]
    public async Task<ActionResult> UpdateUser(string userId, UpdateUserModel request)
    {
        try
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

            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Errors = new List<string> { ex.Message }
            });
        }
    }

    // Password change
    // (matches React POST /admin/users/{id}/password)
    [HttpPost("/admin/users/{userId}/password")]
    public async Task<ActionResult> ChangePassword(string userId, ChangePasswordModel request)
    {
        try
        {
            var result = await _userService.ChangeUserPasswordAsync(
            userId,
            request.Password,
            PasswordChangeType.AdminReset
        );

            if (!result.Succeeded)
            {
                return BadRequest(new
                {
                    Errors = result.Errors.Select(e => e.Description).ToArray()
                });
            }

            return Ok();
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Errors = new List<string> { ex.Message }
            });
        }
    }
}