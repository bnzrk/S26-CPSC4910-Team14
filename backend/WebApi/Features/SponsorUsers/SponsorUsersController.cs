using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Authorization;
using WebApi.Features.SponsorUsers.Models;
using WebApi.Features.Users;

namespace WebApi.Features.SponsorUsers;

[ApiController]
[Route("/users/sponsors")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly IUsersService _usersService;

    public AdminUsersController(
        AppDbContext db, 
        UserManager<User> userManager, 
        IUsersService usersService)
    {
        _db = db;
        _userManager = userManager;
        _usersService = usersService;
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> CreateSponsorUser(CreateSponsorUserModel request)
    {
        // Ensure the request sponsor organization exists.
        var requestOrg = _db.SponsorOrgs.Where(s => s.Id == request.SponsorOrgId).FirstOrDefault();
        if (requestOrg is null)
        {
            return BadRequest("Sponsor organization does not exist.");
        }

        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser is null)
        {
            return Unauthorized();
        }

        // If the user making the request is a sponsor, only allow if they are creating another
        // user for their own sponsor.
        if (currentUser.UserType == UserType.Sponsor)
        {
            var currentSponsor = _db.SponsorUsers.Where(s => s.UserId == currentUser.Id).FirstOrDefault();
            if (currentSponsor is null || currentSponsor.SponsorOrgId != request.SponsorOrgId)
            {
                return BadRequest("Cannot create a sponsor user for a different organization.");
            }
        }

        var result = await _usersService.CreateSponsorUser(request.Email, request.Password, request.FirstName, request.LastName, requestOrg);
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
