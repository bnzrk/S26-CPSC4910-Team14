using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Models;
using System.Security.Claims;

namespace WebApi.Controllers;

[ApiController]
[Route("sponsor-orgs")]
[Authorize]
public class SponsorOrgsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<SponsorOrgsController> _logger;

    public SponsorOrgsController(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        ILogger<SponsorOrgsController> logger)
    {
        _db = db;
        _userManager = userManager;
        _logger = logger;
    }

    // Helpers

    private string? GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier);

    private async Task<SponsorOrg?> GetCurrentUserOrgAsync()
    {
        var userId = GetCurrentUserId();
        if (userId == null) return null;

        return await _db.SponsorOrgs
            .FirstOrDefaultAsync(o => o.Users.Any(u => u.Id == userId));
    }

    private static string[] SplitCsvLine(string line)
    {
        var result = new List<string>();
        bool inQuotes = false;
        var current = new System.Text.StringBuilder();

        foreach (char c in line)
        {
            if (c == '"') { inQuotes = !inQuotes; }
            else if (c == ',' && !inQuotes) { result.Add(current.ToString()); current.Clear(); }
            else { current.Append(c); }
        }
        result.Add(current.ToString());
        return result.ToArray();
    }

    private static int IdxOf(string[] headers, string col) =>
        Array.IndexOf(headers, col.ToLowerInvariant());

    // GET /sponsor-orgs  (Admin only) — list all orgs
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllOrgs()
    {
        var orgs = await _db.SponsorOrgs
            .Select(o => new
            {
                o.Id,
                o.SponsorName,
                o.PointDollarValue,
                userCount   = o.Users.Count,
                driverCount = o.Drivers.Count,
            })
            .ToListAsync();

        return Ok(orgs);
    }

    // POST /sponsor-orgs  (Admin only) — create single org
    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateOrg([FromBody] CreateOrgRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.SponsorName))
            return BadRequest(new { message = "sponsorName is required." });

        var org = new SponsorOrg
        {
            SponsorName      = req.SponsorName,
            PointDollarValue = req.PointDollarValue ?? 0.01m,
        };

        _db.SponsorOrgs.Add(org);
        await _db.SaveChangesAsync();
        return Ok(new { org.Id, org.SponsorName, org.PointDollarValue });
    }

    // POST /sponsor-orgs/bulk  (Admin only)
    //
    // Bulk create sponsor organizations from CSV.
    // CSV columns: sponsorName, pointDollarValue (optional, default 0.01)
    [HttpPost("bulk")]
    [Authorize(Roles = "Admin")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> BulkCreateOrgs(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be a .csv file." });

        var succeeded = 0;
        var failed    = new List<BulkFailureRow>();

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync();
        if (headerLine == null) return BadRequest(new { message = "CSV file is empty." });

        var headers = headerLine.Split(',').Select(h => h.Trim().ToLowerInvariant()).ToArray();
        int nameIdx  = IdxOf(headers, "sponsorname");
        int valueIdx = IdxOf(headers, "pointdollarvalue"); // optional

        if (nameIdx < 0)
            return BadRequest(new { message = "CSV must contain column: sponsorName" });

        int rowNumber = 1;
        string? line;

        while ((line = await reader.ReadLineAsync()) != null)
        {
            rowNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols = SplitCsvLine(line);
            var sponsorName = cols.ElementAtOrDefault(nameIdx)?.Trim();

            if (string.IsNullOrEmpty(sponsorName))
            {
                failed.Add(new BulkFailureRow(rowNumber, "sponsorName is required."));
                continue;
            }

            decimal pointValue = 0.01m;
            if (valueIdx >= 0)
            {
                var rawValue = cols.ElementAtOrDefault(valueIdx)?.Trim();
                if (!string.IsNullOrEmpty(rawValue) && !decimal.TryParse(rawValue, out pointValue))
                {
                    failed.Add(new BulkFailureRow(rowNumber, $"Invalid pointDollarValue '{rawValue}'."));
                    continue;
                }
            }

            var org = new SponsorOrg
            {
                SponsorName      = sponsorName,
                PointDollarValue = pointValue,
            };

            _db.SponsorOrgs.Add(org);
            succeeded++;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Bulk org creation: {S} succeeded, {F} failed.", succeeded, failed.Count);
        return Ok(new { succeeded, failed });
    }

    // GET /sponsor-orgs/me  (Sponsor) — get own org
    [HttpGet("me")]
    [Authorize(Roles = "Sponsor")]
    public async Task<IActionResult> GetMyOrg()
    {
        var org = await GetCurrentUserOrgAsync();
        if (org == null) return NotFound(new { message = "Sponsor organization not found." });

        return Ok(new
        {
            org.Id,
            org.SponsorName,
            org.PointDollarValue,
        });
    }

    // PATCH /sponsor-orgs/me  (Sponsor) — update own org
    [HttpPatch("me")]
    [Authorize(Roles = "Sponsor")]
    public async Task<IActionResult> UpdateMyOrg([FromBody] UpdateOrgRequest req)
    {
        var org = await GetCurrentUserOrgAsync();
        if (org == null) return NotFound();

        if (req.PointDollarValue.HasValue)
            org.PointDollarValue = req.PointDollarValue.Value;

        await _db.SaveChangesAsync();
        return Ok(new { org.Id, org.SponsorName, org.PointDollarValue });
    }

    // GET /sponsor-orgs/me/users  (Sponsor)
    [HttpGet("me/users")]
    [Authorize(Roles = "Sponsor")]
    public async Task<IActionResult> GetMyUsers()
    {
        var org = await GetCurrentUserOrgAsync();
        if (org == null) return NotFound();

        var users = await _db.SponsorOrgs
            .Where(o => o.Id == org.Id)
            .SelectMany(o => o.Users)
            .Select(u => new { u.Id, u.Email, u.FirstName, u.LastName, u.CreatedAt })
            .ToListAsync();

        return Ok(users);
    }

    // POST /sponsor-orgs/me/users/bulk  (Sponsor)
    //
    // Bulk create sponsor users linked to the caller's org.
    // CSV columns: email, firstName, lastName, password
    [HttpPost("me/users/bulk")]
    [Authorize(Roles = "Sponsor")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> BulkCreateSponsorUsers(IFormFile file)
    {
        var org = await GetCurrentUserOrgAsync();
        if (org == null) return NotFound(new { message = "Sponsor organization not found." });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be a .csv file." });

        var succeeded = 0;
        var failed    = new List<BulkFailureRow>();

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync();
        if (headerLine == null) return BadRequest(new { message = "CSV file is empty." });

        var headers   = headerLine.Split(',').Select(h => h.Trim().ToLowerInvariant()).ToArray();
        int emailIdx  = IdxOf(headers, "email");
        int firstIdx  = IdxOf(headers, "firstname");
        int lastIdx   = IdxOf(headers, "lastname");
        int passIdx   = IdxOf(headers, "password");

        if (emailIdx < 0 || firstIdx < 0 || lastIdx < 0 || passIdx < 0)
            return BadRequest(new { message = "CSV must contain columns: email, firstName, lastName, password" });

        int rowNumber = 1;
        string? line;

        while ((line = await reader.ReadLineAsync()) != null)
        {
            rowNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols      = SplitCsvLine(line);
            var email     = cols.ElementAtOrDefault(emailIdx)?.Trim();
            var firstName = cols.ElementAtOrDefault(firstIdx)?.Trim();
            var lastName  = cols.ElementAtOrDefault(lastIdx)?.Trim();
            var password  = cols.ElementAtOrDefault(passIdx)?.Trim();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(firstName) ||
                string.IsNullOrEmpty(lastName) || string.IsNullOrEmpty(password))
            {
                failed.Add(new BulkFailureRow(rowNumber, "One or more required fields are empty."));
                continue;
            }

            var existing = await _userManager.FindByEmailAsync(email);
            if (existing != null)
            {
                failed.Add(new BulkFailureRow(rowNumber, $"Email '{email}' is already registered."));
                continue;
            }

            var user = new ApplicationUser
            {
                UserName  = email,
                Email     = email,
                FirstName = firstName,
                LastName  = lastName,
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                failed.Add(new BulkFailureRow(rowNumber,
                    string.Join("; ", result.Errors.Select(e => e.Description))));
                continue;
            }

            await _userManager.AddToRoleAsync(user, "Sponsor");
            org.Users.Add(user);
            succeeded++;
        }

        await _db.SaveChangesAsync();
        return Ok(new { succeeded, failed });
    }

    // GET /sponsor-orgs/me/drivers  (Sponsor)
    [HttpGet("me/drivers")]
    [Authorize(Roles = "Sponsor")]
    public async Task<IActionResult> GetMyDrivers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var org = await GetCurrentUserOrgAsync();
        if (org == null) return NotFound();

        var query = _db.DriverOrgMemberships
            .Where(m => m.OrgId == org.Id)
            .Select(m => new
            {
                m.Driver.Id,
                m.Driver.Email,
                m.Driver.FirstName,
                m.Driver.LastName,
                m.JoinDate,
            });

        var total = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, items });
    }

    // ─────────────────────────────────────────────────────────────
    // POST /sponsor-orgs/me/drivers/bulk  (Sponsor)
    //
    // Bulk create driver accounts and link them to the sponsor's org.
    // CSV columns: email, firstName, lastName, password
    // ─────────────────────────────────────────────────────────────
    [HttpPost("me/drivers/bulk")]
    [Authorize(Roles = "Sponsor")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> BulkCreateDrivers(IFormFile file)
    {
        var org = await GetCurrentUserOrgAsync();
        if (org == null) return NotFound(new { message = "Sponsor organization not found." });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be a .csv file." });

        var succeeded = 0;
        var failed    = new List<BulkFailureRow>();

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync();
        if (headerLine == null) return BadRequest(new { message = "CSV file is empty." });

        var headers  = headerLine.Split(',').Select(h => h.Trim().ToLowerInvariant()).ToArray();
        int emailIdx = IdxOf(headers, "email");
        int firstIdx = IdxOf(headers, "firstname");
        int lastIdx  = IdxOf(headers, "lastname");
        int passIdx  = IdxOf(headers, "password");

        if (emailIdx < 0 || firstIdx < 0 || lastIdx < 0 || passIdx < 0)
            return BadRequest(new { message = "CSV must contain columns: email, firstName, lastName, password" });

        int rowNumber = 1;
        string? line;

        while ((line = await reader.ReadLineAsync()) != null)
        {
            rowNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols      = SplitCsvLine(line);
            var email     = cols.ElementAtOrDefault(emailIdx)?.Trim();
            var firstName = cols.ElementAtOrDefault(firstIdx)?.Trim();
            var lastName  = cols.ElementAtOrDefault(lastIdx)?.Trim();
            var password  = cols.ElementAtOrDefault(passIdx)?.Trim();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(firstName) ||
                string.IsNullOrEmpty(lastName) || string.IsNullOrEmpty(password))
            {
                failed.Add(new BulkFailureRow(rowNumber, "One or more required fields are empty."));
                continue;
            }

            var existing = await _userManager.FindByEmailAsync(email);
            if (existing != null)
            {
                failed.Add(new BulkFailureRow(rowNumber, $"Email '{email}' is already registered."));
                continue;
            }

            var user = new ApplicationUser
            {
                UserName  = email,
                Email     = email,
                FirstName = firstName,
                LastName  = lastName,
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                failed.Add(new BulkFailureRow(rowNumber,
                    string.Join("; ", result.Errors.Select(e => e.Description))));
                continue;
            }

            await _userManager.AddToRoleAsync(user, "Driver");

            // Create org membership
            _db.DriverOrgMemberships.Add(new DriverOrgMembership
            {
                DriverId = user.Id,
                OrgId    = org.Id,
                JoinDate = DateTime.UtcNow,
            });

            succeeded++;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Bulk driver creation for org {OrgId}: {S} succeeded, {F} failed.", org.Id, succeeded, failed.Count);
        return Ok(new { succeeded, failed });
    }

    // ─────────────────────────────────────────────────────────────
    // POST /sponsor-orgs/me/drivers/bulk-points  (Sponsor)
    //
    // Bulk update driver point balances.
    // CSV columns: driverEmail, balanceChange (int), reason
    // ─────────────────────────────────────────────────────────────
    [HttpPost("me/drivers/bulk-points")]
    [Authorize(Roles = "Sponsor")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> BulkUpdateDriverPoints(IFormFile file)
    {
        var org = await GetCurrentUserOrgAsync();
        if (org == null) return NotFound(new { message = "Sponsor organization not found." });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be a .csv file." });

        var succeeded = 0;
        var failed    = new List<BulkFailureRow>();

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync();
        if (headerLine == null) return BadRequest(new { message = "CSV file is empty." });

        var headers     = headerLine.Split(',').Select(h => h.Trim().ToLowerInvariant()).ToArray();
        int emailIdx    = IdxOf(headers, "driveremail");
        int changeIdx   = IdxOf(headers, "balancechange");
        int reasonIdx   = IdxOf(headers, "reason");

        if (emailIdx < 0 || changeIdx < 0 || reasonIdx < 0)
            return BadRequest(new { message = "CSV must contain columns: driverEmail, balanceChange, reason" });

        int rowNumber = 1;
        string? line;

        while ((line = await reader.ReadLineAsync()) != null)
        {
            rowNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols        = SplitCsvLine(line);
            var driverEmail = cols.ElementAtOrDefault(emailIdx)?.Trim();
            var rawChange   = cols.ElementAtOrDefault(changeIdx)?.Trim();
            var reason      = cols.ElementAtOrDefault(reasonIdx)?.Trim();

            if (string.IsNullOrEmpty(driverEmail) || string.IsNullOrEmpty(rawChange) || string.IsNullOrEmpty(reason))
            {
                failed.Add(new BulkFailureRow(rowNumber, "driverEmail, balanceChange, and reason are required."));
                continue;
            }

            if (!int.TryParse(rawChange, out int balanceChange))
            {
                failed.Add(new BulkFailureRow(rowNumber, $"Invalid balanceChange value '{rawChange}'. Must be an integer."));
                continue;
            }

            // Find driver in this org
            var driverUser = await _userManager.FindByEmailAsync(driverEmail);
            if (driverUser == null)
            {
                failed.Add(new BulkFailureRow(rowNumber, $"No user found with email '{driverEmail}'."));
                continue;
            }

            var membership = await _db.DriverOrgMemberships
                .FirstOrDefaultAsync(m => m.DriverId == driverUser.Id && m.OrgId == org.Id);

            if (membership == null)
            {
                failed.Add(new BulkFailureRow(rowNumber, $"Driver '{driverEmail}' is not a member of your organization."));
                continue;
            }

            // Get current balance and create transaction
            var currentBalance = await _db.PointTransactions
                .Where(t => t.DriverId == driverUser.Id && t.OrgId == org.Id)
                .SumAsync(t => (int?)t.BalanceChange) ?? 0;

            var newBalance = currentBalance + balanceChange;

            _db.PointTransactions.Add(new PointTransaction
            {
                DriverId      = driverUser.Id,
                OrgId         = org.Id,
                BalanceChange = balanceChange,
                NewBalance    = newBalance,
                Reason        = reason,
                CreatedAt     = DateTime.UtcNow,
            });

            succeeded++;
        }

        await _db.SaveChangesAsync();
        _logger.LogInformation("Bulk point update for org {OrgId}: {S} succeeded, {F} failed.", org.Id, succeeded, failed.Count);
        return Ok(new { succeeded, failed });
    }

    // ─────────────────────────────────────────────────────────────
    // POST /sponsor-orgs/me/drivers/bulk-update  (Sponsor)
    //
    // Bulk update driver profile information.
    // CSV columns: driverId (required), email, firstName, lastName (all optional)
    // Empty cells are skipped — only provided values are updated.
    // ─────────────────────────────────────────────────────────────
    [HttpPost("me/drivers/bulk-update")]
    [Authorize(Roles = "Sponsor")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> BulkUpdateDriverInfo(IFormFile file)
    {
        var org = await GetCurrentUserOrgAsync();
        if (org == null) return NotFound(new { message = "Sponsor organization not found." });

        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be a .csv file." });

        var succeeded = 0;
        var failed    = new List<BulkFailureRow>();

        using var reader = new StreamReader(file.OpenReadStream());
        var headerLine = await reader.ReadLineAsync();
        if (headerLine == null) return BadRequest(new { message = "CSV file is empty." });

        var headers   = headerLine.Split(',').Select(h => h.Trim().ToLowerInvariant()).ToArray();
        int idIdx     = IdxOf(headers, "driverid");
        int emailIdx  = IdxOf(headers, "email");
        int firstIdx  = IdxOf(headers, "firstname");
        int lastIdx   = IdxOf(headers, "lastname");

        if (idIdx < 0)
            return BadRequest(new { message = "CSV must contain column: driverId" });

        int rowNumber = 1;
        string? line;

        while ((line = await reader.ReadLineAsync()) != null)
        {
            rowNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols      = SplitCsvLine(line);
            var driverId  = cols.ElementAtOrDefault(idIdx)?.Trim();

            if (string.IsNullOrEmpty(driverId))
            {
                failed.Add(new BulkFailureRow(rowNumber, "driverId is required."));
                continue;
            }

            // Verify driver belongs to this org
            var membership = await _db.DriverOrgMemberships
                .FirstOrDefaultAsync(m => m.DriverId == driverId && m.OrgId == org.Id);

            if (membership == null)
            {
                failed.Add(new BulkFailureRow(rowNumber, $"Driver '{driverId}' is not a member of your organization."));
                continue;
            }

            var driver = await _userManager.FindByIdAsync(driverId);
            if (driver == null)
            {
                failed.Add(new BulkFailureRow(rowNumber, $"No user found with ID '{driverId}'."));
                continue;
            }

            bool changed = false;

            if (emailIdx >= 0)
            {
                var newEmail = cols.ElementAtOrDefault(emailIdx)?.Trim();
                if (!string.IsNullOrEmpty(newEmail) && newEmail != driver.Email)
                {
                    driver.Email    = newEmail;
                    driver.UserName = newEmail;
                    changed = true;
                }
            }

            if (firstIdx >= 0)
            {
                var newFirst = cols.ElementAtOrDefault(firstIdx)?.Trim();
                if (!string.IsNullOrEmpty(newFirst))
                {
                    driver.FirstName = newFirst;
                    changed = true;
                }
            }

            if (lastIdx >= 0)
            {
                var newLast = cols.ElementAtOrDefault(lastIdx)?.Trim();
                if (!string.IsNullOrEmpty(newLast))
                {
                    driver.LastName = newLast;
                    changed = true;
                }
            }

            if (changed)
            {
                var result = await _userManager.UpdateAsync(driver);
                if (!result.Succeeded)
                {
                    failed.Add(new BulkFailureRow(rowNumber,
                        string.Join("; ", result.Errors.Select(e => e.Description))));
                    continue;
                }
            }

            succeeded++;
        }

        _logger.LogInformation("Bulk driver info update for org {OrgId}: {S} succeeded, {F} failed.", org.Id, succeeded, failed.Count);
        return Ok(new { succeeded, failed });
    }
}

// DTOs
public record CreateOrgRequest(string SponsorName, decimal? PointDollarValue);
public record UpdateOrgRequest(decimal? PointDollarValue);