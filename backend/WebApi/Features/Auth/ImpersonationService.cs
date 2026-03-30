using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using WebApi.Data.Entities;

namespace WebApi.Features.Auth;

public class ImpersonationService : IImpersonationService
{
    private const int ImpersonationLengthHours = 2;
    private const string OriginalUserIdClaimType = "OriginalUserId";
    private const string OriginalUserNameClaimType = "OriginalUserName";
    private const string ImpersonationOrgScopeClaimType = "ImpersonationOrgScope";
    private const string ImpersonationScheme = "Impersonation";
    
    private readonly UserManager<User> _userManager;
    private readonly IHttpContextAccessor _http;

    public ImpersonationService(UserManager<User> userManager, IHttpContextAccessor http)
    {
        _userManager = userManager;
        _http = http;
    }

    public bool IsImpersonating(ClaimsPrincipal user)
    {
        return user.HasClaim(c => c.Type == "OriginalUserId");
    }

    public int? GetSponsorOrgScopeId(ClaimsPrincipal user)
    {
        var scopeIdString = user.FindFirstValue(ImpersonationOrgScopeClaimType);
        var parsed = Int32.TryParse(scopeIdString, out int orgId);
        if (!parsed)
            throw new Exception("Could not parse org scope id from claim");
        return orgId;
    }

    public string? GetImpersonatingUserId(ClaimsPrincipal user)
    {
        return user.FindFirstValue(OriginalUserIdClaimType);
    }

    public async Task StartImpersonationAsync(string targetUserId, int? orgScopeId = null)
    {
        var context = _http.HttpContext!;
        var currentUser = context.User;

        var originalUserId = currentUser.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var originalUserName = currentUser.FindFirstValue(ClaimTypes.Name)!;

        var targetUser = await _userManager.FindByIdAsync(targetUserId)
            ?? throw new Exception("Impersonation target user not found.");

        var targetRoles = await _userManager.GetRolesAsync(targetUser);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, targetUser.Id),
            new(ClaimTypes.Name, targetUser.UserName!),
            new(ClaimTypes.Email, targetUser.Email!),
            new(OriginalUserIdClaimType, originalUserId),
            new(OriginalUserNameClaimType, originalUserName),
        };

        foreach (var role in targetRoles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (orgScopeId is not null)
        {
            claims.Add(new Claim(ImpersonationOrgScopeClaimType, $"{orgScopeId}"));
        }

        var identity = new ClaimsIdentity(claims, ImpersonationScheme);
        var principal = new ClaimsPrincipal(identity);

        await context.SignInAsync(ImpersonationScheme, principal, new AuthenticationProperties
        {
            IsPersistent = false,
            ExpiresUtc = DateTimeOffset.UtcNow.AddHours(ImpersonationLengthHours)
        });
    }

    public async Task StopImpersonationAsync()
    {
        var context = _http.HttpContext!;
        await context.SignOutAsync(ImpersonationScheme);
    }
}