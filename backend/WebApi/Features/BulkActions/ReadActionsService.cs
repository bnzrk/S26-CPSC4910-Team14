namespace WebApi.Features.BulkActions;

public class ReadActionsService : IReadActionsService
{
    private readonly Dictionary<string, ActionType> _actionTypeCodes = new()
    {
        { "O", ActionType.Org },
        { "S", ActionType.Sponsor },
        { "D", ActionType.Driver }
    };

    public async Task<List<Action>> ReadActionsFromFile(IFormFile file, bool isSponsor, List<ProcessingError> errors)
    {
        List<LineResult> results = ReadFile(file);
        return await ProcessResults(results, isSponsor, errors);
    }

    private async Task<List<Action>> ProcessResults(List<LineResult> results, bool isSponsor, List<ProcessingError> errors)
    {
        // List<Action> OrgActions = new();
        // List<Action> SponsorActions = new();
        // List<Action> DriverActions = new();
        List<Action> actions = new();

        foreach (var result in results)
        {
            if (result.Error is not null)
            {
                errors.Add(new ProcessingError(result.Line, result.Error));
                continue;
            }

            if (result.Tokens.Length == 0)
                continue;

            try
            {
                Action action = ProcessAction(result.Line, result.Tokens);
                var error = GetActionError(action, isSponsor);
                if (error != null)
                {
                    errors.Add(new ProcessingError(result.Line, error));
                    continue;
                }

                actions.Add(action);
                // switch (action.Type)
                // {
                //     case ActionType.Org:
                //         OrgActions.Add(action);
                //         break;
                //     case ActionType.Sponsor:
                //         SponsorActions.Add(action);
                //         break;
                //     case ActionType.Driver:
                //         DriverActions.Add(action);
                //         break;
                // }
            }
            catch (Exception ex)
            {
                errors.Add(new ProcessingError(result.Line, ex.Message));
                continue;
            }
        }

        // List<Action> actions = [.. OrgActions, .. SponsorActions, .. DriverActions];
        return actions;
    }

    // Processes an array of string tokens read from a line of the file into an action.
    private Action ProcessAction(int line, string[] tokens)
    {
        // Ensure action code is a valid type
        var actionCode = tokens[0].ToUpper();
        if (!_actionTypeCodes.TryGetValue(actionCode, out ActionType actionType))
            throw new Exception($"Invalid action code: {actionCode}");

        // Helper function for trying to get token at a given index
        string? Get(int i) => tokens.Length > i ? tokens[i] : null;

        return new Action(line, actionType)
        {
            OrgName = Get(1),
            UserFirstName = Get(2),
            UserLastName = Get(3),
            UserEmail = Get(4),
            PointTransactionAmount = Get(5) is string s
                ? int.TryParse(s, out int amount) ? amount : null
                : null,
            PointTransactionReason = Get(6)
        };
    }

    // Reads each line of the file and returns a list of line results.
    private List<LineResult> ReadFile(IFormFile file)
    {
        using var reader = new StreamReader(file.OpenReadStream());
        List<LineResult> results = new();
        int lineNumber = 1;
        string? line;
        while ((line = reader.ReadLine()) != null)
        {
            if (!string.IsNullOrWhiteSpace(line))
            {
                LineResult result = ReadLine(line, lineNumber);
                results.Add(result);
            }
            lineNumber++;
        }
        return results;
    }

    // Reads a string and seperates its delimited tokens into an array.
    private LineResult ReadLine(string line, int lineNumber)
    {
        string[] tokens = line.Split('|');
        string actionCode = tokens.First();

        if (tokens.Length == 0 || !_actionTypeCodes.ContainsKey(actionCode.ToUpper()))
            return new LineResult(lineNumber, [], $"Invalid action code: {actionCode}");

        return new LineResult(lineNumber, tokens);
    }

    // Returns an error with the action's formatting or null if no errors.
    private string? GetActionError(Action action, bool isSponsor)
    {
        if (action.Type == ActionType.Org)
            return GetOrgActionError(action, isSponsor);
        if (action.Type == ActionType.Sponsor)
            return GetSponsorActionError(action, isSponsor);
        if (action.Type == ActionType.Driver)
            return GetDriverActionError(action, isSponsor);

        return "Invalid action type.";
    }

    private string? GetOrgActionError(Action action, bool isSponsor)
    {
        if (isSponsor)
            return "Sponsors cannot create an organization.";
        if (String.IsNullOrEmpty(action.OrgName))
            return "Missing organization name.";

        var hasOtherParameters = !String.IsNullOrEmpty(action.UserFirstName)
            || !String.IsNullOrEmpty(action.UserLastName)
            || !String.IsNullOrEmpty(action.UserEmail)
            || action.PointTransactionAmount != null
            || !String.IsNullOrEmpty(action.PointTransactionReason);
        if (hasOtherParameters)
            return "Organization create action should only have 2 parameters.";

        return null;
    }

    private string? GetSponsorActionError(Action action, bool isSponsor)
    {
        if (!String.IsNullOrEmpty(action.OrgName) && isSponsor)
            return "Sponsors cannot specify an organization.";
        if (String.IsNullOrEmpty(action.UserFirstName))
            return "Missing user's first name.";
        if (String.IsNullOrEmpty(action.UserLastName))
            return "Missing user's last name.";
        if (String.IsNullOrEmpty(action.UserEmail))
            return "Missing user's email.";
        if (action.PointTransactionAmount != null)
            return "Cannot specify point amount for sponsor user action.";
        if (String.IsNullOrEmpty(action.PointTransactionReason))
            return "Cannot specify point change reason for sponsor user action.";
        return null;
    }

    private string? GetDriverActionError(Action action, bool isSponsor)
    {
        if (!String.IsNullOrEmpty(action.OrgName) && isSponsor)
            return "Sponsors cannot specify an organization.";
        if (String.IsNullOrEmpty(action.UserFirstName))
            return "Missing driver's first name.";
        if (String.IsNullOrEmpty(action.UserLastName))
            return "Missing driver's last name.";
        if (String.IsNullOrEmpty(action.UserEmail))
            return "Missing driver's email.";
        if (action.PointTransactionAmount.HasValue && String.IsNullOrEmpty(action.PointTransactionReason))
            return "Missing point change reason";
        if (!action.PointTransactionAmount.HasValue && !String.IsNullOrEmpty(action.PointTransactionReason))
            return "Missing or invalid point change amount.";
        return null;
    }
}