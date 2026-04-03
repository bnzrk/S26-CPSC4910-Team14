namespace WebApi.Features.BulkActions;

public interface IReadActionsService
{
    public Task<List<Action>> ReadActionsFromFile(IFormFile file, bool isSponsor, List<ProcessingError> errors);
}