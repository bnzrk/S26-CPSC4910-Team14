using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Features.Points.Models;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Features.Points;

[ApiController]
[Route("/points")]
public class PointsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;

    public PointsController(AppDbContext db, UserManager<User> userManager)
    {
        _db = db;
        _userManager = userManager;
    }

    [HttpPost("transactions")]
    [Authorize(Policy = PolicyNames.SponsorOnly)]
    public async Task<ActionResult> CreatePointTransaction(PointTransactionModel request)
    {
        var currentUserId = _userManager.GetUserId(User);
        var sponsor = await _db.SponsorUsers.Where(s => s.UserId == currentUserId).FirstOrDefaultAsync();
        if (sponsor is null)
        {
            return BadRequest();
        }

        // Ensure driver exists and is in the same org as the sponsor.
        var driver = await _db.DriverUsers.Where(d => d.Id == request.DriverId).FirstOrDefaultAsync();
        if (driver is null || driver.SponsorOrgId != sponsor.SponsorOrgId)
        {
            return BadRequest("Invalid driver.");
        }

        var transaction = new PointTransaction
        {
            SponsorOrgId = sponsor.SponsorOrgId,
            DriverUserId = request.DriverId,
            Reason = request.Reason,
            BalanceChange = request.BalanceChange,
            TransactionDateUtc = DateTime.UtcNow
        };
        _db.PointTransactions.Add(transaction);
        _db.SaveChanges();

        return Ok();
    }

    [HttpGet("drivers/{driverId}")]
    [Authorize]
    public async Task<ActionResult> GetDriverPoints(int driverId)
    {
        var points = await _db.PointTransactions.Where(p => p.DriverUserId == driverId).Select(p => p.BalanceChange).SumAsync();
        return Ok(points);
    }
}