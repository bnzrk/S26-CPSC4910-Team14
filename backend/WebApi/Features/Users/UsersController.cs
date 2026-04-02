using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using WebApi.Helpers.Pagination;
using WebApi.Features.Auth.Models;
using WebApi.Data;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Features.Users;

[ApiController]
[Route("/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IUsersService _usersService;
    private readonly UserManager<User> _userManager;

    public UsersController(AppDbContext db, UserManager<User> userManager, IUsersService usersService)
    {
        _db = db;
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

    [HttpGet]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult<PagedResult<UserModel>>> GetUsers(
        [FromQuery] int? pageSize,
        [FromQuery] int? page,
        [FromQuery] string? query
    )
    {
        string[] tokens = query?.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries) ?? [];

        var pageQuery = _db.Users.AsNoTracking();
        foreach (string token in tokens)
        {
            var t = token;
            pageQuery = pageQuery.Where(u =>
                EF.Functions.Like(u.FirstName, t + "%") ||
                EF.Functions.Like(u.LastName, t + "%") ||
                EF.Functions.Like(u.Email!, t + "%"));
        }

        var queryPage = page is not null ? page.Value : 1;
        var queryPageSize = pageSize is not null ? pageSize.Value : 20;
        var results = await PagedResult.ToPagedResultAsync(pageQuery, queryPage, queryPageSize);
        return Ok(results);
    }
}
