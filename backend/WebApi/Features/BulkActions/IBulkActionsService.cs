namespace WebApi.Features.BulkActions;

public interface IBulkActionsService
{
    public Task ExecuteActions(List<Action> actions, bool isSponsor, List<ProcessingError> errors);
}