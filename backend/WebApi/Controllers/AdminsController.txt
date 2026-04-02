using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Models;
using WebApi.Services;
using System.Globalization;

namespace WebApi.Controllers;

[ApiController]
[Route("[controller]")]
[Authorize(Roles = "Admin")]
public class AdminsController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ISponsorOrgService _sponsorOrgService;
    private readonly ILogger<AdminsController> _logger;

    public AdminsController(
        UserManager<ApplicationUser> userManager,
        ISponsorOrgService sponsorOrgService,
        ILogger<AdminsController> logger)
    {
        _userManager = userManager;
        _sponsorOrgService = sponsorOrgService;
        _logger = logger;
    }

    // POST /admins  — create a single admin user
    [HttpPost]
    public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Email) ||
            string.IsNullOrWhiteSpace(req.Password) ||
            string.IsNullOrWhiteSpace(req.FirstName) ||
            string.IsNullOrWhiteSpace(req.LastName))
        {
            return BadRequest(new { message = "Email, password, firstName, and lastName are required." });
        }

        var user = new ApplicationUser
        {
            UserName = req.Email,
            Email = req.Email,
            FirstName = req.FirstName,
            LastName = req.LastName,
        };

        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = string.Join("; ", result.Errors.Select(e => e.Description)) });
        }

        await _userManager.AddToRoleAsync(user, "Admin");
        return Ok(new { id = user.Id, email = user.Email });
    }

    // POST /admins/bulk  — bulk create users from CSV
    //
    // CSV columns (header row required):
    //   email, firstName, lastName, password, role
    //   role must be one of: admin, sponsor, driver  (case-insensitive)
    // Returns: { succeeded: int, failed: [{ row: int, reason: string }] }
    [HttpPost("bulk")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    public async Task<IActionResult> BulkCreateUsers(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded." });

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "File must be a .csv file." });

        var succeeded = 0;
        var failed = new List<BulkFailureRow>();

        using var reader = new StreamReader(file.OpenReadStream());

        // Parse header
        var headerLine = await reader.ReadLineAsync();
        if (headerLine == null)
            return BadRequest(new { message = "CSV file is empty." });

        var headers = headerLine.Split(',').Select(h => h.Trim().ToLowerInvariant()).ToArray();
        int IdxOf(string col) => Array.IndexOf(headers, col);

        int emailIdx = IdxOf("email");
        int firstIdx = IdxOf("firstname");
        int lastIdx  = IdxOf("lastname");
        int passIdx  = IdxOf("password");
        int roleIdx  = IdxOf("role");

        if (emailIdx < 0 || firstIdx < 0 || lastIdx < 0 || passIdx < 0 || roleIdx < 0)
        {
            return BadRequest(new
            {
                message = "CSV must contain columns: email, firstName, lastName, password, role"
            });
        }

        var validRoles = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Admin", "Sponsor", "Driver" };
        int rowNumber = 1;

        string? line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
            rowNumber++;
            if (string.IsNullOrWhiteSpace(line)) continue;

            var cols = SplitCsvLine(line);
            if (cols.Length <= Math.Max(emailIdx, Math.Max(firstIdx, Math.Max(lastIdx, Math.Max(passIdx, roleIdx)))))
            {
                failed.Add(new BulkFailureRow(rowNumber, "Row has insufficient columns."));
                continue;
            }

            var email     = cols[emailIdx].Trim();
            var firstName = cols[firstIdx].Trim();
            var lastName  = cols[lastIdx].Trim();
            var password  = cols[passIdx].Trim();
            var role      = cols[roleIdx].Trim();

            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(firstName) ||
                string.IsNullOrEmpty(lastName) || string.IsNullOrEmpty(password) ||
                string.IsNullOrEmpty(role))
            {
                failed.Add(new BulkFailureRow(rowNumber, "One or more required fields are empty."));
                continue;
            }

            // Normalize role to title-case for Identity
            var normalizedRole = CultureInfo.InvariantCulture.TextInfo.ToTitleCase(role.ToLowerInvariant());
            if (!validRoles.Contains(normalizedRole))
            {
                failed.Add(new BulkFailureRow(rowNumber, $"Invalid role '{role}'. Must be admin, sponsor, or driver."));
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
                UserName = email,
                Email    = email,
                FirstName = firstName,
                LastName  = lastName,
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var reason = string.Join("; ", result.Errors.Select(e => e.Description));
                failed.Add(new BulkFailureRow(rowNumber, reason));
                continue;
            }

            await _userManager.AddToRoleAsync(user, normalizedRole);
            succeeded++;
        }

        _logger.LogInformation("Bulk user upload: {Succeeded} succeeded, {Failed} failed.", succeeded, failed.Count);
        return Ok(new { succeeded, failed });
    }

    // Helpers

    /// <summary>
    /// Splits a single CSV line, respecting double-quoted fields.
    /// </summary>
    private static string[] SplitCsvLine(string line)
    {
        var result = new List<string>();
        bool inQuotes = false;
        var current = new System.Text.StringBuilder();

        foreach (char c in line)
        {
            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                result.Add(current.ToString());
                current.Clear();
            }
            else
            {
                current.Append(c);
            }
        }
        result.Add(current.ToString());
        return result.ToArray();
    }
}

// DTOs
public record CreateAdminRequest(
    string Email,
    string? Username,
    string FirstName,
    string LastName,
    string Password
);

public record BulkFailureRow(int Row, string Reason);