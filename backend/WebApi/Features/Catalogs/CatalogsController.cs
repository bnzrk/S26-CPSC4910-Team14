using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data.Enums;
using WebApi.Data.Entities;
using WebApi.Features.Catalogs.Models;
using WebApi.Data;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Features.Catalogs;

[ApiController]
[Route("/sponsor-orgs/{orgId}/catalog")]
public class CatalogsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICatalogsService _catalogs;
    private readonly UserManager<User> _userManager;

    public CatalogsController(AppDbContext db, ICatalogsService catalogs, UserManager<User> userManager)
    {
        _db = db;
        _catalogs = catalogs;
        _userManager = userManager;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<List<CatalogItemModel>>> GetCatalogItems(int orgId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isDriver = User.IsInRole(UserTypeRoles.Role(UserType.Driver));
        if (isSponsor || isDriver)
        {
            var isInOrg = isSponsor
                ? await _db.SponsorUsers
                    .AsNoTracking()
                    .AnyAsync(s => s.UserId == userId && s.SponsorOrgId == orgId)
                : await _db.DriverUsers
                    .AsNoTracking()
                    .Include(d => d.SponsorOrgs)
                    .AnyAsync(d => d.UserId == userId && d.SponsorOrgs.Any(o => o.Id == orgId));

            if (!isInOrg)
                return NotFound();
        }

        try
        {
            var items = await _catalogs.GetOrgCatalogAsync(orgId);
            return Ok(items);
        }
        catch { }

        return NotFound();
    }

    [HttpPost]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> CreateCatalogItem(int orgId, [FromBody] CreateCatalogItemModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor)
        {
            var isInOrg = await _db.SponsorUsers.AnyAsync(s => s.UserId == userId && s.SponsorOrgId == orgId);
            if (!isInOrg)
                return NotFound();
        }

        try
        {
            await _catalogs.CreateCatalogItem(orgId, request.ExternalItemId, request.CatalogPrice);
            return Created();
        }
        catch { }

        return BadRequest();
    }
}