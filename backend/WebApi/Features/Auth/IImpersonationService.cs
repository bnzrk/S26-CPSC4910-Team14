using System.Security.Claims;

namespace WebApi.Features.Auth;

public interface IImpersonationService
{
    public Task StartImpersonationAsync(string targetUserId, int? orgScopeId = null);
    public Task StopImpersonationAsync();

    public bool IsImpersonating(ClaimsPrincipal user);
}