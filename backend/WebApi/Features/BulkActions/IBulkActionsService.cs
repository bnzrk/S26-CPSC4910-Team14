using System.Security.Claims;

namespace WebApi.Features.BulkActions;

public interface IBulkActionsService
{
    public Task ExecuteActions(List<Action> actions, ClaimsPrincipal actor, List<ProcessingError> errors);
}