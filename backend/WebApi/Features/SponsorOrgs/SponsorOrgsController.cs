using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Features.SponsorOrgs.Models;

namespace WebApi.Features.SponsorOrgs;

[ApiController]
[Route("/sponsor-orgs")]
public class SponsorOrgsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SponsorOrgsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> CreateSponsorOrg(CreateSponsorOrgModel request)
    {
        var org = new SponsorOrg
        {
            SponsorName = request.SponsorName,
            DateJoined = DateTime.UtcNow
        };
        _db.SponsorOrgs.Add(org);
        _db.SaveChanges();

        return Ok();
    }

    // Drivers will be added to sponsor orgs through applications late.r
    [HttpPost("drivers")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> AddDriverToOrg(AddDriverToSponsorOrgModel request)
    {
        var driver = _db.DriverUsers.Where(d => d.UserId == request.DriverId).FirstOrDefault();
        if (driver is null)
        {
            return BadRequest("Driver does not exist.");
        }

        if (driver.SponsorOrgId is not null)
        {
            return BadRequest("Driver already belongs to a sponsor.");
        }

        driver.SponsorOrgId = request.SponsorOrgId;
        _db.SaveChanges();

        return Ok();
    }

    [HttpDelete("drivers")]
    [Authorize(Policy = PolicyNames.AdminOnly)]
    public async Task<ActionResult> RemoveDriverFromOrg(string driverId)
    {
        var driver = _db.DriverUsers.Where(d => d.UserId == driverId).FirstOrDefault();
        if (driver is null)
        {
            return BadRequest("Driver does not exist.");
        }

        if (driver.SponsorOrgId is null)
        {
            return BadRequest("Driver already does not have a sponsor.");
        }

        driver.SponsorOrgId = null;
        _db.SaveChanges();

        return Ok();
    }
}
