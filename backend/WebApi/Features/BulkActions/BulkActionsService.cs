using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using System.Text.Json;
using MySql.Data.MySqlClient;

namespace WebApi.Features.BulkActions;

public class BulkActionsService : IBulkActionsService
{
    private readonly AppDbContext _db;

    public BulkActionsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task ExecuteActions(List<Action> actions, bool isSponsor, List<ProcessingError> errors)
    {
        List<Action> orgActions = actions.Where(a => a.Type == ActionType.Org).ToList();
        List<Action> sponsorActions = actions.Where(s => s.Type == ActionType.Sponsor).ToList();
        List<Action> driverActions = actions.Where(s => s.Type == ActionType.Driver).ToList();

        // Create orgs first in case other actions use them
        await ExecuteOrgActions(orgActions, errors);
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
}