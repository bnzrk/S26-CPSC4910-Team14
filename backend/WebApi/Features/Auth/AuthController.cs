using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Features.Auth.Models;
using WebApi.Data.Entities;
using Microsoft.AspNetCore.Authorization;
using WebApi.Data;
using WebApi.Audit;
using WebApi.Data.Enums;
using WebApi.Features.Users;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Features.Auth;

[ApiController]
[Route("/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IImpersonationService _impersonationService;
    private readonly IAuditLogger _auditLogger;
    private readonly IUsersService _usersService;

    public AuthController(
        AppDbContext db,
        UserManager<User> userManager,
        IUsersService usersService,
        SignInManager<User> signInManager,
        IImpersonationService impersonationService,
        IAuditLogger auditLogger)
    {
        _db = db;
        _userManager = userManager;
        _signInManager = signInManager;
        _impersonationService = impersonationService;
        _auditLogger = auditLogger;
        _usersService = usersService;
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
        if (!result.Succeeded)
        {
            await _auditLogger.CreateLoginAuditLog(login.Email, false);
            return BadRequest("Invalid email or password.");
        }

        await _auditLogger.CreateLoginAuditLog(login.Email, true);

        user.LastLoginUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult> Register(RegisterModel request)
    {
        var role = request.Role?.ToLower() == "sponsor" ? UserType.Sponsor : UserType.Driver;
        IdentityResult result;

        if (role == UserType.Sponsor)
        {
            var org = new SponsorOrg
            {
                SponsorName = $"{request.FirstName} {request.LastName}",
                DateJoined = DateTime.UtcNow
            };
            _db.SponsorOrgs.Add(org);
            await _db.SaveChangesAsync();
            result = await _usersService.CreateSponsorUser(request.Email, request.Password, request.FirstName, request.LastName, org);
        }
        else
        {
            result = await _usersService.CreateDriverUser(request.Email, request.Password, request.FirstName, request.LastName);
        }

        if (!result.Succeeded)
            return BadRequest(new { Errors = result.Errors.Select(e => e.Description).ToArray() });

        return Created();
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout()
    {
        if (_impersonationService.IsImpersonating(User))
            await _impersonationService.StopImpersonationAsync();
        else
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
            return Ok(new AuthModel
            {
                IsAuthenticated = false,
                User = null
            });
        }

        return Ok(new AuthModel
        {
            IsAuthenticated = true,
            User = new UserModel
            {
                Id = user.Id,
                Email = user.Email!,
                FirstName = user.FirstName,
                LastName = user.LastName,
                UserType = user.UserType.ToString(),
                IsImpersonating = _impersonationService.IsImpersonating(User),
            }
        });
    }

    #region Impersonation
    [HttpPost("impersonation/start")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> StartImpersonation([FromBody] string targetUserId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        if (_impersonationService.IsImpersonating(User))
            return BadRequest("Already impersonating");

        var targetUser = await _userManager.FindByIdAsync(targetUserId);
        if (targetUser is null)
            return NotFound();

        // Disallow impersonation of admin users
        if (targetUser.UserType == UserType.Admin)
            return Forbid();

        // If sponsor, validate org of target user
        int? orgScopeId = null;
        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            if (targetUser.UserType != UserType.Driver)
                return Forbid();

            var sponsorOrgId = await _db.SponsorUsers
                .AsNoTracking()
                .Where(s => s.User.Id == userId)
                .Select(s => s.SponsorOrgId)
                .SingleOrDefaultAsync();

            var isDriverInOrg = await _db.DriverUsers
                .AsNoTracking()
                .AnyAsync(d => d.User.Id == targetUserId
                    && d.SponsorOrgs.Any(s => s.Id == sponsorOrgId));

            if (!isDriverInOrg)
                return NotFound();

            orgScopeId = sponsorOrgId;
        }

        await _impersonationService.StartImpersonationAsync(targetUserId, orgScopeId);

        return Ok();
    }

    [HttpPost("impersonation/stop")]
    [Authorize]
    public async Task<ActionResult> StopImpersonation()
    {
        if (!_impersonationService.IsImpersonating(User))
            return BadRequest("Not currently impersonating");

        await _impersonationService.StopImpersonationAsync();

        return Ok();
    }
    #endregion

    #region Profile
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult> GetProfile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        return Ok(new UserModel
        {
            Id = user.Id,
            Email = user.Email!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            UserType = user.UserType.ToString()
        });
    }

    [HttpPatch("profile")]
    [Authorize]
    public async Task<ActionResult> UpdateProfile([FromBody] UpdateProfileModel request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Email = request.Email;
        user.UserName = request.Email;
        user.NormalizedEmail = request.Email.ToUpper();
        user.NormalizedUserName = request.Email.ToUpper();

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        return Ok();
    }

    [HttpPatch("profile/password")]
    [Authorize]
    public async Task<ActionResult> UpdatePassword([FromBody] UpdatePasswordModel request)
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            await _auditLogger.CreatePasswordChangeAuditLog(user.Id, user.Email!, PasswordChangeType.SelfUpdate, false);
            return BadRequest(result.Errors.Select(e => e.Description));
        }

        await _auditLogger.CreatePasswordChangeAuditLog(user.Id, user.Email!, PasswordChangeType.SelfUpdate, true);
        return Ok();
    }
    #endregion

    [HttpDelete("account")]
    [Authorize]
    public async Task<ActionResult> DeleteAccount()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        await _signInManager.SignOutAsync();
        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));

        return Ok();
    }
}
