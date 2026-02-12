using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
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
}
