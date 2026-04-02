using Microsoft.AspNetCore.Authentication;

namespace WebApi.Features.Auth;

public class ImpersonationMiddleware
{
    private readonly RequestDelegate _next;

    public ImpersonationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Check if an impersonation cookie exists
        var impersonationResult = await context.AuthenticateAsync("Impersonation");

        if (impersonationResult.Succeeded && impersonationResult.Principal is not null)
        {
            // Replace the context user with the impersonation user
            context.User = impersonationResult.Principal;
        }

        await _next(context);
    }
}