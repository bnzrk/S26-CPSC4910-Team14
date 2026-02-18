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
}
