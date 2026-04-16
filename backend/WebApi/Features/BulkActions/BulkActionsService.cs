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

    public async Task<int> ExecuteActions(List<Action> actions, ClaimsPrincipal actor, List<ProcessingError> errors)
    {
        List<Action> orgActions = actions.Where(a => a.Type == ActionType.Org).ToList();
        List<Action> sponsorActions = actions.Where(s => s.Type == ActionType.Sponsor).ToList();
        List<Action> driverActions = actions.Where(s => s.Type == ActionType.Driver).ToList();

        int successCount = 0;
        // Execute org actions with rollback on exception
        await using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            successCount += await ExecuteOrgActions(orgActions, errors);
            successCount += await ExecuteSponsorActions(sponsorActions, actor, errors);
            successCount += await ExecuteDriverActions(driverActions, actor, errors);
            await transaction.CommitAsync();

            // Sort errors by line number
            errors.Sort((a, b) => a.Line.CompareTo(b.Line));
            return successCount;
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    private async Task<int> ExecuteOrgActions(List<Action> orgActions, List<ProcessingError> errors)
    {
        int successCount = 0;

        string[] orgNames = orgActions
            .Where(n => n != null)
            .Select(a => a.OrgName!)
            .Distinct()
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

        foreach (var action in orgActions)
        {
            if (action.OrgName == null)
            {
                errors.Add(new ProcessingError(action.Line, "Organization name cannot be empty"));
                continue;
            }
            if (existingOrgs.Contains(action.OrgName))
            {
                errors.Add(new ProcessingError(action.Line, $"{action.OrgName} already exists"));
                continue;
            }

            SponsorOrg org = new SponsorOrg
            {
                SponsorName = action.OrgName,
                DateJoined = DateTime.UtcNow,
                Catalog = new Catalog()
            };

            _db.SponsorOrgs.Add(org);
            existingOrgs.Add(action.OrgName);
            successCount++;
        }
        await _db.SaveChangesAsync();
        return successCount;
    }

    private async Task<int> ExecuteSponsorActions(List<Action> sponsorActions, ClaimsPrincipal actor, List<ProcessingError> errors)
    {
        int successCount = 0;

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

        List<SponsorUser> addedUsers = new();
        HashSet<string> addedUserEmails = new();
        foreach (var action in sponsorActions)
        {
            if (addedUserEmails.Contains(action.UserEmail!))
            {
                errors.Add(new ProcessingError(action.Line, $"Duplicate action with email {action.UserEmail}"));
                continue;
            }
            if (existingUsers.ContainsKey(action.UserEmail!))
            {
                errors.Add(new ProcessingError(action.Line, $"Email {action.UserEmail} already in use"));
                continue;
            }
            if (isSponsor && !String.IsNullOrEmpty(action.OrgName))
            {
                errors.Add(new ProcessingError(action.Line, "Sponsors should not specify an organization"));
                continue;
            }
            if (isAdmin)
            {
                if (String.IsNullOrEmpty(action.OrgName))
                {
                    errors.Add(new ProcessingError(action.Line, $"Missing organization name"));
                    continue;
                }
                else if (!existingOrgs.ContainsKey(action.OrgName))
                {
                    errors.Add(new ProcessingError(action.Line, $"Organization {action.OrgName} does not exist"));
                    continue;
                }
            }

            var orgId = isSponsor ? actorOrgId :
                (action.OrgName != null && existingOrgs.TryGetValue(action.OrgName, out SponsorOrg? selectedOrg)) ? selectedOrg?.Id : null;
            if (!orgId.HasValue)
            {
                errors.Add(new ProcessingError(action.Line, $"Could not resolve organization from name"));
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
                ?? throw new InvalidOperationException("Default password not configured");
            user.PasswordHash = _hasher.HashPassword(user, defaultPassword);

            var sponsor = new SponsorUser
            {
                User = user,
                SponsorOrgId = orgId.Value
            };

            _db.SponsorUsers.Add(sponsor);
            addedUsers.Add(sponsor);
            addedUserEmails.Add(sponsor.User.Email);
            successCount++;
        }
        await _db.SaveChangesAsync();

        // Apply roles to added users
        _db.UserRoles.AddRange(addedUsers.Select(u => new IdentityUserRole<string>
        {
            UserId = u.UserId,
            RoleId = sponsorRole.Id
        }));
        await _db.SaveChangesAsync();
        return successCount;
    }

    private async Task<int> ExecuteDriverActions(List<Action> driverActions, ClaimsPrincipal actor, List<ProcessingError> errors)
    {
        int successCount = 0;

        var actorUserId = _userManager.GetUserId(actor);
        var isSponsor = actor.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isAdmin = actor.IsInRole(UserTypeRoles.Role(UserType.Admin));
        SponsorOrg? actorOrg = isSponsor ? await _db.SponsorUsers.Include(s => s.SponsorOrg).Where(s => s.UserId == actorUserId).Select(s => s.SponsorOrg).SingleOrDefaultAsync() : null;

        var driverRole = await _db.Roles.SingleAsync(r => r.Name == UserTypeRoles.Role(UserType.Driver));

        // Find and existing users specified in actions
        var usersJson = JsonSerializer.Serialize(driverActions.Select(a => a.UserEmail).Distinct());
        var existingNonDrivers = (await _db.Users
            .FromSqlRaw("""
                SELECT u.* FROM AspNetUsers u
                INNER JOIN JSON_TABLE(
                    {0}, '$[*]' COLUMNS (
                        email VARCHAR(255) PATH '$'
                    )
                ) j ON u.Email = j.email
                WHERE u.UserType != 0
                """, usersJson)
            .AsNoTracking()
            .ToListAsync())
            .ToDictionary(u => u.Email!);

        Dictionary<string, DriverUser> existingDrivers = (await _db.DriverUsers
            .FromSqlRaw("""
                SELECT d.* FROM DriverUsers d
                INNER JOIN AspNetUsers u ON d.UserId = u.Id
                INNER JOIN JSON_TABLE(
                    {0}, '$[*]' COLUMNS (
                        email VARCHAR(255) PATH '$'
                    )
                ) j ON u.Email = j.email
                """, usersJson)
            .Include(d => d.User)
            .ToListAsync())
            .ToDictionary(u => u.User.Email!);

        // Find any existing orgs specified in actions
        string[] orgNames = driverActions
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

        Dictionary<string, DriverUser> addedUsers = new();
        foreach (var action in driverActions)
        {
            var hasPointChange = action.PointTransactionAmount.HasValue && !String.IsNullOrEmpty(action.PointTransactionReason);
            var driverIsAdded = addedUsers.ContainsKey(action.UserEmail!);
            var driverExists = existingDrivers.ContainsKey(action.UserEmail!);
            var nonDriverExists = existingNonDrivers.ContainsKey(action.UserEmail!);

            if (!hasPointChange && driverIsAdded)
            {
                errors.Add(new ProcessingError(action.Line, $"Duplicate action with email {action.UserEmail}"));
                continue;
            }
            if (nonDriverExists || (!hasPointChange && driverExists))
            {
                errors.Add(new ProcessingError(action.Line, $"Email {action.UserEmail} already in use"));
                continue;
            }
            if (isSponsor && !String.IsNullOrEmpty(action.OrgName))
            {
                errors.Add(new ProcessingError(action.Line, "Sponsors should not specify an organization"));
                continue;
            }
            if (isAdmin)
            {
                if (String.IsNullOrEmpty(action.OrgName))
                {
                    errors.Add(new ProcessingError(action.Line, $"Missing organization name"));
                    continue;
                }
                else if (!existingOrgs.ContainsKey(action.OrgName))
                {
                    errors.Add(new ProcessingError(action.Line, $"Organization {action.OrgName} does not exist"));
                    continue;
                }
            }
            if (action.PointTransactionAmount.HasValue && String.IsNullOrEmpty(action.PointTransactionReason))
            {
                errors.Add(new ProcessingError(action.Line, $"Missing point change reason"));
                continue;
            }
            if (!action.PointTransactionAmount.HasValue && !String.IsNullOrEmpty(action.PointTransactionReason))
            {
                errors.Add(new ProcessingError(action.Line, $"Missing point change amount"));
                continue;
            }

            SponsorOrg? org = isSponsor ? actorOrg :
                (action.OrgName != null && existingOrgs.TryGetValue(action.OrgName, out SponsorOrg? selectedOrg)) ? selectedOrg : null;
            if (org is null)
            {
                errors.Add(new ProcessingError(action.Line, $"Could not resolve organization from name"));
                continue;
            }

            if (!(nonDriverExists || driverExists || driverIsAdded))
            {
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
                    UserType = UserType.Driver,
                    IsActive = true,
                    CreatedDateUtc = DateTime.UtcNow
                };
                string defaultPassword = _config["Defaults:UserPassword"]
                    ?? throw new InvalidOperationException("Default password not configured");
                user.PasswordHash = _hasher.HashPassword(user, defaultPassword);

                var driver = new DriverUser
                {
                    User = user
                };
                driver.SponsorOrgs.Add(org);

                _db.DriverUsers.Add(driver);
                addedUsers.Add(driver.User.Email, driver);
            }

            // Check added dictionary again in case it was updated this action
            driverIsAdded = addedUsers.ContainsKey(action.UserEmail!);

            // If points included, add transaction
            if (hasPointChange && (driverExists || driverIsAdded))
            {
                var driver = driverExists && existingDrivers.TryGetValue(action.UserEmail!, out DriverUser? existingDriver) ? existingDriver :
                    driverIsAdded && addedUsers.TryGetValue(action.UserEmail!, out DriverUser? addedDriver) ? addedDriver : null;
                if (driver is null)
                {
                    errors.Add(new ProcessingError(action.Line, "Could not resolve driver for point change"));
                    continue;
                }
                driver.PointTransactions.Add(new PointTransaction
                {
                    SponsorOrg = org,
                    BalanceChange = action.PointTransactionAmount!.Value,
                    Reason = action.PointTransactionReason!
                });
            }
            successCount++;
        }
        await _db.SaveChangesAsync();

        // Apply roles to added users
        _db.UserRoles.AddRange(addedUsers.Values.Select(u => new IdentityUserRole<string>
        {
            UserId = u.UserId,
            RoleId = driverRole.Id
        }));
        await _db.SaveChangesAsync();
        return successCount;
    }
}