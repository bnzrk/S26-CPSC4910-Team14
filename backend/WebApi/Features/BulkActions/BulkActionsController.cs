using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data.Entities;
using WebApi.Data;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Authorization;
using Mysqlx;
using MySqlX.XDevAPI.Common;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using System.Runtime.CompilerServices;

namespace WebApi.Features.Users;

[ApiController]
[Route("/bulk")]
public class BulkActionsController : ControllerBase
{
    public enum ActionType
    {
        Org,
        Sponsor,
        Driver
    }
    private readonly AppDbContext _db;
    private readonly IUsersService _usersService;
    private readonly UserManager<User> _userManager;

    private readonly Dictionary<string, ActionType> _actionTypeCodes = new()
    {
        { "O", ActionType.Org },
        { "S", ActionType.Sponsor },
        { "D", ActionType.Driver }
    };

    public BulkActionsController(AppDbContext db, UserManager<User> userManager, IUsersService usersService)
    {
        _db = db;
        _usersService = usersService;
        _userManager = userManager;
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

        List<LineResult> results = ReadFile(file);
        List<ProcessingError> errors = new();

        var actions = await ProcessResults(results, isSponsor, errors);

        return Ok(new {
            Actions = actions,
            Errors = errors
        });
    }

    private async Task<List<Action>> ProcessResults(List<LineResult> results, bool isSponsor, List<ProcessingError> errors)
    {
        List<Action> OrgActions = new();
        List<Action> SponsorActions = new();
        List<Action> DriverActions = new();

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

                switch (action.Type)
                {
                    case ActionType.Org:
                        OrgActions.Add(action);
                        break;
                    case ActionType.Sponsor:
                        SponsorActions.Add(action);
                        break;
                    case ActionType.Driver:
                        DriverActions.Add(action);
                        break;
                }
            }
            catch (Exception ex)
            {
                errors.Add(new ProcessingError(result.Line, ex.Message));
                continue;
            }
        }

        List<Action> actions = [.. OrgActions, .. SponsorActions, .. DriverActions];
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

    private record ProcessingError(int Line, string Error);
    private record LineResult(int Line, string[] Tokens, string? Error = null);
    public record Action
    {
        public int Line { get; set; }
        public ActionType Type { get; set; }
        public string? OrgName { get; set; }
        public string? UserFirstName { get; set; }
        public string? UserLastName { get; set; }
        public string? UserEmail { get; set; }
        public int? PointTransactionAmount { get; set; }
        public string? PointTransactionReason { get; set; }

        public Action(int Line, ActionType Type, string? OrgName = null, string? UserFirstName = null, string? UserLastName = null, string? UserEmail = null, int? PointTransactionAmount = null, string? PointTransactionReason = null)
        {
            this.Line = Line;
            this.Type = Type;
            this.OrgName = OrgName;
            this.UserFirstName = UserFirstName;
            this.UserLastName = UserLastName;
            this.UserEmail = UserEmail;
            this.PointTransactionAmount = PointTransactionAmount;
            this.PointTransactionReason = PointTransactionReason;
        }
    }
}

