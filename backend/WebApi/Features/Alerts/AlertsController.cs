using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Features.Alerts.Models;

namespace WebApi.Features.Orders;

[ApiController]
[Route("/alerts")]
public class AlertsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;

    public AlertsController(AppDbContext db, UserManager<User> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult<List<AlertModel>>> GetAlerts()
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driver = await _db.DriverUsers.AsNoTracking().Where(d => d.UserId == userId).SingleOrDefaultAsync();
        if (driver is null)
            return BadRequest("Could not resolve driver.");

        var alerts = await _db.PointTransactionAlerts
            .Where(a => a.DriverId == driver.Id)
            .OrderByDescending(a => a.TimestampUtc)
            .Select(a => new AlertModel
            {
                Id = a.Id,
                Type = AlertType.PointChange,
                TimestampUtc = a.TimestampUtc,
                Metadata = new PointTransactionAlertMetadata
                {
                    SponsorName = a.Transaction.SponsorOrg.SponsorName,
                    BalanceChange = a.Transaction.BalanceChange,
                    Reason = a.Transaction.Reason,
                }
            })
            .ToListAsync();

        return Ok(alerts);
    }
}