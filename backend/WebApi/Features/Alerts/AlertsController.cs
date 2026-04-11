using System.ComponentModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Features.Alerts.Models;

namespace WebApi.Features.Alerts;

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

    [HttpDelete("{alertId}")]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult> DismissAlert([FromRoute] int alertId, [FromQuery] AlertType alertType)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driver = await _db.DriverUsers.AsNoTracking().Where(d => d.UserId == userId).SingleOrDefaultAsync();
        if (driver is null)
            return BadRequest("Could not resolve driver.");

        switch (alertType)
        {
            case AlertType.Order:
                var orderAlert = await _db.OrderAlerts.Where(a => a.Id == alertId && a.DriverId == driver.Id).SingleOrDefaultAsync();
                if (orderAlert is null)
                    return NotFound();
                _db.OrderAlerts.Remove(orderAlert);
                break;
            case AlertType.PointChange:
                var pointAlert = await _db.PointTransactionAlerts.Where(a => a.Id == alertId && a.DriverId == driver.Id).SingleOrDefaultAsync();
                if (pointAlert is null)
                    return NotFound();
                _db.PointTransactionAlerts.Remove(pointAlert);
                break;
            case AlertType.SponsorshipChange:
                var sponsorshipAlert = await _db.SponsorshipChangeAlerts.Where(a => a.Id == alertId && a.DriverId == driver.Id).SingleOrDefaultAsync();
                if (sponsorshipAlert is null)
                    return NotFound();
                _db.SponsorshipChangeAlerts.Remove(sponsorshipAlert);
                break;
            default:
                return BadRequest("Invalid or unspecified alert type.");
        }

        await _db.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult> DismissAllAlerts()
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driverId = await _db.DriverUsers.AsNoTracking().Where(d => d.UserId == userId).Select(d => (int?)d.Id).SingleOrDefaultAsync();
        if (!driverId.HasValue)
            return BadRequest("Could not resolve driver.");


        await using var transaction = await _db.Database.BeginTransactionAsync();

        try
        {
            await _db.OrderAlerts.Where(a => a.DriverId == driverId.Value).ExecuteDeleteAsync();
            await _db.PointTransactionAlerts.Where(a => a.DriverId == driverId.Value).ExecuteDeleteAsync();
            await _db.SponsorshipChangeAlerts.Where(a => a.DriverId == driverId.Value).ExecuteDeleteAsync();
            await transaction.CommitAsync();
        }
        catch
        {
            await transaction.RollbackAsync();
            throw new Exception("Failed to dismiss alerts.");
        }

        return Ok();
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

        var pointAlerts = await _db.PointTransactionAlerts
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

        var sponsorshipAlerts = await _db.SponsorshipChangeAlerts
            .Where(a => a.DriverId == driver.Id)
            .OrderByDescending(a => a.TimestampUtc)
            .Select(a => new AlertModel
            {
                Id = a.Id,
                Type = AlertType.SponsorshipChange,
                TimestampUtc = a.TimestampUtc,
                Metadata = new SponsorshipChangeAlertMetadata
                {
                    SponsorName = a.SponsorOrg.SponsorName,
                    ChangeType = a.ChangeType
                }
            })
            .ToListAsync();

        var orderAlerts = await _db.OrderAlerts
            .Where(a => a.DriverId == driver.Id)
            .OrderByDescending(a => a.TimestampUtc)
            .Select(a => new AlertModel
            {
                Id = a.Id,
                Type = AlertType.Order,
                TimestampUtc = a.TimestampUtc,
                Metadata = new OrderAlertMetadata
                {
                    OrderId = a.OrderId,
                    ItemSummary = a.Order.Items.First().Title + ((a.Order.Items.Count > 1) ? $" and {a.Order.Items.Count - 1} other items" : ""),
                    PointTotal = a.Order.Items.Sum(i => i.PricePoints)
                }
            })
            .ToListAsync();

        var allAlerts = new List<AlertModel>(pointAlerts.Count + sponsorshipAlerts.Count + orderAlerts.Count);
        allAlerts.AddRange(pointAlerts);
        allAlerts.AddRange(sponsorshipAlerts);
        allAlerts.AddRange(orderAlerts);
        allAlerts = allAlerts.OrderByDescending(a => a.TimestampUtc).ToList();

        Console.WriteLine(allAlerts);

        return Ok(allAlerts);
    }

    [HttpGet("settings")]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult<AlertSettingsModel>> GetAlertSettings()
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driver = await _db.DriverUsers
            .Include(d => d.AlertSettings)
            .SingleOrDefaultAsync(d => d.UserId == userId);

        if (driver is null)
            return NotFound();

        if (driver.AlertSettings is null)
        {
            driver.AlertSettings = new DriverAlertSettings();
            await _db.SaveChangesAsync();
        }

        return Ok(new AlertSettingsModel
        {
            IsOrderAlertsEnabled = driver.AlertSettings.IsOrderAlertsEnabled,
            IsPointChangeAlertsEnabled = driver.AlertSettings.IsPointChangeAlertsEnabled,
        });
    }

    [HttpPut("settings")]
    [Authorize(Policy = PolicyNames.DriverOnly)]
    public async Task<ActionResult> UpdateAlertSettings([FromBody] AlertSettingsModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driver = await _db.DriverUsers
            .Include(d => d.AlertSettings)
            .SingleOrDefaultAsync(d => d.UserId == userId);

        if (driver is null)
            return NotFound();

        if (driver.AlertSettings is null)
            driver.AlertSettings = new DriverAlertSettings();

        driver.AlertSettings.IsOrderAlertsEnabled = request.IsOrderAlertsEnabled;
        driver.AlertSettings.IsPointChangeAlertsEnabled = request.IsPointChangeAlertsEnabled;
        await _db.SaveChangesAsync();

        return Ok();
    }
}