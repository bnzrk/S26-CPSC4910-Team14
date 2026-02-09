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

    // Returns the most recent about info entry.
    [HttpGet]
    public async Task<ActionResult<AboutInfoModel>> GetAboutInfo()
    {
        var aboutInfo = await _db.AboutInfos
            .AsNoTracking()
            .OrderByDescending(a => a.ReleaseDateUtc)
            .Select(a => new AboutInfoModel
            {
                Team = a.Team,
                Version = a.Version,
                ReleaseDateUtc = a.ReleaseDateUtc,
                ProductName = a.ProductName,
                ProductDescription = a.ProductDescription
            })
            .FirstOrDefaultAsync();

        return (aboutInfo is null) ? NotFound() : aboutInfo;
    }
}