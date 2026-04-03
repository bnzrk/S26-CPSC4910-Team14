using System.Text.Json;
using MySql.Data.MySqlClient;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Features.Users;

namespace WebApi.Features.BulkActions;

public class BulkActionsService : IBulkActionsService
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly IUsersService _usersService;
    private readonly IPasswordHasher<User> _hasher;
    private readonly IConfiguration _config;

    public BulkActionsService(AppDbContext db, UserManager<User> userManager, IUsersService usersService, IPasswordHasher<User> hasher, IConfiguration config)
    {
        _db = db;
        _userManager = userManager;
        _usersService = usersService;
        _hasher = hasher;
        _config = config;
    }

    public async Task ExecuteActions(List<Action> actions, ClaimsPrincipal actor, List<ProcessingError> errors)
    {
        List<Action> orgActions = actions.Where(a => a.Type == ActionType.Org).ToList();
        List<Action> sponsorActions = actions.Where(s => s.Type == ActionType.Sponsor).ToList();
        List<Action> driverActions = actions.Where(s => s.Type == ActionType.Driver).ToList();

        // Execute org actions with rollback on exception
        // await using var orgTransaction = await _db.Database.BeginTransactionAsync();
        try
        {
            await ExecuteOrgActions(orgActions, errors);
            // await orgTransaction.CommitAsync();
        }
        catch
        {
            // await orgTransaction.RollbackAsync();
            throw;
        }

        // Execute sponsor user actions with rollback on exception
        // await using var sponsorTransaction = await _db.Database.BeginTransactionAsync();
        try
        {
            await ExecuteSponsorActions(sponsorActions, actor, errors);
            // await sponsorTransaction.CommitAsync();     
        }
        catch
        {
            // await sponsorTransaction.RollbackAsync();
            throw;
        }

    }

    private async Task ExecuteOrgActions(List<Action> orgActions, List<ProcessingError> errors)
    {
        string[] orgNames = orgActions
            .Where(n => n != null)
            .Select(a => a.OrgName!)
            .ToArray();

        var json = JsonSerializer.Serialize(orgNames);

        var existingOrgs = await _db.SponsorOrgs
            .FromSqlRaw(@"
                SELECT s.SponsorName
                FROM SponsorOrgs s
                JOIN JSON_TABLE(@json, '$[*]' COLUMNS(Value VARCHAR(255) PATH '$')) jt
                ON s.SponsorName = jt.Value
            ", new MySqlParameter("@json", json))
            .Select(s => s.SponsorName)
            .ToHashSetAsync();

        Console.WriteLine("--------------------------------------------------");
        foreach (var action in orgActions)
        {
            if (action.OrgName == null)
            {
                errors.Add(new ProcessingError(action.Line, "Organization name cannot be empty."));
                continue;
            }
            if (existingOrgs.Contains(action.OrgName))
            {
                errors.Add(new ProcessingError(action.Line, $"{action.OrgName} already exists."));
                continue;
            }

            SponsorOrg org = new SponsorOrg
            {
                SponsorName = action.OrgName,
                DateJoined = DateTime.UtcNow,
                Catalog = new Catalog()
            };

            // _db.SponsorOrgs.Add(org);
            Console.WriteLine($"Creating org: {action.OrgName}");
            existingOrgs.Add(action.OrgName);
        }
        Console.WriteLine("--------------------------------------------------");
        // await _db.SaveChangesAsync();
    }

    private async Task ExecuteSponsorActions(List<Action> sponsorActions, ClaimsPrincipal actor, List<ProcessingError> errors)
    {
        await using var transaction = await _db.Database.BeginTransactionAsync();

        var actorUserId = _userManager.GetUserId(actor);

        var isSponsor = actor.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isAdmin = actor.IsInRole(UserTypeRoles.Role(UserType.Admin));
        int? actorOrgId = isSponsor ? await _db.SponsorUsers.Where(s => s.UserId == actorUserId).Select(s => (int)s.SponsorOrgId).SingleOrDefaultAsync() : null;
        var sponsorRole = await _db.Roles.SingleAsync(r => r.Name == UserTypeRoles.Role(UserType.Sponsor));

        // Find and existing users specified in actions
        var usersJson = JsonSerializer.Serialize(sponsorActions.Select(a => a.UserEmail).Distinct());
        Dictionary<string, User> existingUsers = (await _db.Users
            .FromSqlRaw("""
                SELECT u.* FROM AspNetUsers u
                INNER JOIN JSON_TABLE(
                    {0}, '$[*]' COLUMNS (
                        email VARCHAR(255) PATH '$'
                    )
                ) j ON u.Email = j.email
                AND u.UserType = 1
                """, usersJson)
            .ToListAsync())
            .ToDictionary(u => u.Email!);

        // Find any existing orgs specified in actions
        string[] orgNames = sponsorActions
            .Where(n => n != null)
            .Select(a => a.OrgName!)
            .Distinct()
            .ToArray();
        var orgsJson = JsonSerializer.Serialize(orgNames);
        var existingOrgs = (await _db.SponsorOrgs
            .FromSqlRaw(@"
                SELECT s.* FROM SponsorOrgs s
                JOIN JSON_TABLE({0}, '$[*]' COLUMNS(Value VARCHAR(255) PATH '$')) jt
                ON s.SponsorName = jt.Value
            ", orgsJson)
            .ToListAsync())
            .ToDictionary(o => o.SponsorName);

        Console.Write(existingOrgs.ToString());

        List<SponsorUser> addedUsers = new();
        HashSet<string> addedUserEmails = new();
        Console.WriteLine("--------------------------------------------------");
        foreach (var action in sponsorActions)
        {
            if (addedUserEmails.Contains(action.UserEmail!))
            {
                errors.Add(new ProcessingError(action.Line, $"Duplicate action with email {action.UserEmail}."));
                continue;
            }
            if (existingUsers.ContainsKey(action.UserEmail!))
            {
                errors.Add(new ProcessingError(action.Line, $"Email {action.UserEmail} already in use."));
                continue;
            }
            if (isSponsor && action.OrgName != null)
            {
                errors.Add(new ProcessingError(action.Line, "Sponsors should not specify an organization."));
                continue;
            }
            if (isAdmin)
            {
                if (String.IsNullOrEmpty(action.OrgName))
                {
                    errors.Add(new ProcessingError(action.Line, $"Missing organization name."));
                    continue;
                }
                else if (!existingOrgs.ContainsKey(action.OrgName))
                {
                    errors.Add(new ProcessingError(action.Line, $"Organization {action.OrgName} does not exist."));
                    continue;
                }
            }

            var orgId = isSponsor ? actorOrgId :
                (action.OrgName != null && existingOrgs.TryGetValue(action.OrgName, out SponsorOrg? selectedOrg)) ? selectedOrg?.Id : null;
            if (!orgId.HasValue)
            {
                errors.Add(new ProcessingError(action.Line, $"Could not resolve organization from name."));
                continue;
            }

            // Since we can't rely on the user manager for bulk inserts, we have to construct this unholy abomination
            var user = new User
            {
                UserName = action.UserEmail,
                NormalizedUserName = action.UserEmail!.ToUpperInvariant(),
                Email = action.UserEmail,
                NormalizedEmail = action.UserEmail.ToUpperInvariant(),
                SecurityStamp = Guid.NewGuid().ToString(),
                ConcurrencyStamp = Guid.NewGuid().ToString(),
                FirstName = action.UserFirstName!,
                LastName = action.UserLastName!,
                UserType = UserType.Sponsor,
                IsActive = true,
                CreatedDateUtc = DateTime.UtcNow
            };
            string defaultPassword = _config["Defaults:UserPassword"]
                ?? throw new InvalidOperationException("Default password not configured.");
            user.PasswordHash = _hasher.HashPassword(user, defaultPassword);

            var sponsor = new SponsorUser
            {
                User = user,
                SponsorOrgId = orgId.Value
            };

            Console.WriteLine($"Adding sponsor user: {sponsor.User.FirstName} {sponsor.User.LastName} {sponsor.User.Email}");
            // _db.SponsorUsers.Add(sponsor);
            addedUsers.Add(sponsor);
            addedUserEmails.Add(sponsor.User.Email);
        }
        // await _db.SaveChangesAsync();

        // Apply roles to added users
        // _db.UserRoles.AddRange(addedUsers.Select(u => new IdentityUserRole<string>
        // {
        //     UserId = u.UserId,
        //     RoleId = sponsorRole.Id
        // }));
        Console.WriteLine("Adding roles");
        // await _db.SaveChangesAsync();
        Console.WriteLine("--------------------------------------------------");
    }
}