using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data.Entities;
using WebApi.Data;
using WebApi.Data.Enums;
using WebApi.Features.Users;
using Microsoft.AspNetCore.Authorization;

namespace WebApi.Features.BulkActions;

[ApiController]
[Route("/bulk")]
public class BulkActionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IUsersService _usersService;
    private readonly UserManager<User> _userManager;
    private readonly IReadActionsService _readActionsService;
    private readonly IBulkActionsService _bulkActionsService;

    public BulkActionsController(
        AppDbContext db, 
        UserManager<User> userManager, 
        IUsersService usersService, 
        IReadActionsService readActionsService,
        IBulkActionsService bulkActionsService)
    {
        _db = db;
        _usersService = usersService;
        _userManager = userManager;
        _readActionsService = readActionsService;
        _bulkActionsService = bulkActionsService;
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> BulkAction(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });
  
        if (!file.FileName.EndsWith(".txt", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be a .txt file." });

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isAdmin = User.IsInRole(UserTypeRoles.Role(UserType.Admin));

        List<ProcessingError> errors = new();
        var actions = await _readActionsService.ReadActionsFromFile(file, isSponsor, errors);

        int successCount = 0;
        try
        {
            successCount += await _bulkActionsService.ExecuteActions(actions, User, errors);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }

        return Ok(new {
            Completed = successCount,
            Errors = errors
        });
    }   
}

