using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Features.About.Models;

namespace WebApi.Features.About;

[ApiController]
[Route("/about")]
public class AboutController : ControllerBase
{
    private readonly AppDbContext _db;

    public AboutController(AppDbContext db)
    {
        _db = db;
    }

    // Returns the most recent about info entry with all child data.
    [HttpGet]
    public async Task<ActionResult<AboutInfoModel>> GetAboutInfo()
    {
        var aboutInfo = await _db.AboutInfos
            .AsNoTracking()
            .Include(a => a.TeamMembers.OrderBy(t => t.DisplayOrder))
            .Include(a => a.Features.OrderBy(f => f.DisplayOrder))
            .Include(a => a.TechStackItems.OrderBy(t => t.DisplayOrder))
            .OrderByDescending(a => a.ReleaseDateUtc)
            .Select(a => new AboutInfoModel
            {
                TeamNumber = a.Team,
                VersionNumber = $"Sprint {a.Version}",
                ReleaseDate = a.ReleaseDateUtc,
                ProductName = a.ProductName,
                ProductDescription = a.ProductDescription,
                TeamMembers = a.TeamMembers.OrderBy(t => t.DisplayOrder).Select(t => new AboutInfoModel.TeamMemberModel
                {
                    FirstName = t.FirstName,
                    LastName = t.LastName,
                    Role = t.Role
                }).ToList(),
                Features = a.Features.OrderBy(f => f.DisplayOrder).Select(f => new AboutInfoModel.FeatureModel
                {
                    Title = f.Title,
                    Description = f.Description,
                    Icon = f.Icon
                }).ToList(),
                TechStack = a.TechStackItems.OrderBy(t => t.DisplayOrder).Select(t => new AboutInfoModel.TechStackItemModel
                {
                    Name = t.Name,
                    Category = t.Category
                }).ToList()
            })
            .FirstOrDefaultAsync();

        return (aboutInfo is null) ? NotFound() : aboutInfo;
    }

    [HttpPost("new")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> UpdateAboutInfo()
    {
        var sprintStart = new DateTime(2026, 2, 5, 0, 0, 0, DateTimeKind.Utc);
        var now = DateTime.UtcNow;
        int sprintWeek = 1 + (int)(now - sprintStart).TotalDays / 7;

        var aboutInfo = await _db.AboutInfos.OrderByDescending(a => a.ReleaseDateUtc).FirstOrDefaultAsync();
        if (aboutInfo is null)
        {
            var newAboutInfo = new AboutInfo
            {
                Team = 14,
                Version = sprintWeek,
                ReleaseDateUtc = now,
                ProductName = "DrivePoints",
                ProductDescription = "A rewards platform where sponsor companies award points to truck drivers for good driving behavior, redeemable for products from a sponsor-managed catalog."
            };
            _db.SaveChanges();
            return Ok();
        }

        aboutInfo.Version = sprintWeek;
        aboutInfo.ReleaseDateUtc = now;
        _db.SaveChanges();

        return Ok();
    }
    [HttpPost("team-members")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> AddTeamMember([FromBody] AddTeamMemberModel request)
    {
        var aboutInfo = await _db.AboutInfos
            .OrderByDescending(a => a.ReleaseDateUtc)
            .FirstOrDefaultAsync();

        if (aboutInfo is null)
            return NotFound();

        var member = new TeamMember
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            AboutInfoId = aboutInfo.Id,
            DisplayOrder = 0
        };

        _db.TeamMembers.Add(member);
        await _db.SaveChangesAsync();

        return Ok();
    }
}
