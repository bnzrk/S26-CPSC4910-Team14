using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using WebApi.Features.DriverApplications.Models;
using WebApi.Audit;
using WebApi.Features.Alerts;

namespace WebApi.Features.DriverApplications;

[ApiController]
[Route("/applications")]
public class DriverApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly IAuditLogger _auditLogger;
    private readonly IAlertsService _alertsService;

    public DriverApplicationsController(
        AppDbContext db,
        UserManager<User> userManager,
        IAuditLogger auditLogger,
        IAlertsService alertsService)
    {
        _db = db;
        _userManager = userManager;
        _auditLogger = auditLogger;
        _alertsService = alertsService;
    }

    [HttpGet]
    [Authorize(Policy = PolicyNames.SponsorOnly)]
    public async Task<ActionResult<List<DriverApplicationModel>>> GetMyOrgApplications()
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var sponsorOrgId = await _db.SponsorUsers
            .AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => (int?)s.SponsorOrgId)
            .SingleOrDefaultAsync();

        if (!sponsorOrgId.HasValue)
            return NotFound();

        var applications = await _db.DriverApplications
            .AsNoTracking()
            .Where(a => a.SponsorOrgId == sponsorOrgId.Value && a.IsActive)
            .Select(a => new DriverApplicationModel
            {
                Id = a.Id,
                DriverUserId = a.DriverUserId,
                SponsorOrgId = a.SponsorOrgId,
                FirstName = a.FirstName,
                LastName = a.LastName,
                PhoneNumber = a.PhoneNumber,
                Birthday = a.Birthday,
                PreviousEmployee = a.PreviousEmployee,
                TruckMake = a.TruckMake,
                TruckYear = a.TruckYear,
                TruckModel = a.TruckModel,
                LicensePlate = a.LicensePlate,
                Status = a.Status,
                IsActive = a.IsActive
            })
            .ToListAsync();

        return Ok(applications);
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult> CreateApplication([FromBody] CreateDriverApplicationModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var driverId = await _db.DriverUsers
            .AsNoTracking()
            .Where(d => d.UserId == userId)
            .Select(d => (int?)d.Id)
            .SingleOrDefaultAsync();

        if (driverId is null)
            return Unauthorized();

        var sponsorOrgExists = await _db.SponsorOrgs
            .AsNoTracking()
            .AnyAsync(o => o.Id == request.SponsorOrgId);

        if (!sponsorOrgExists)
            return NotFound();

        var driverAlreadyInOrg = await _db.DriverUsers
            .AnyAsync(d => d.Id == driverId.Value && d.SponsorOrgs.Any(o => o.Id == request.SponsorOrgId));

        if (driverAlreadyInOrg)
            return BadRequest("Already a driver for this sponsor.");

        var application = new DriverApplication
        {
            DriverUserId = driverId,
            SponsorOrgId = request.SponsorOrgId,
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            Birthday = request.Birthday,
            PreviousEmployee = request.PreviousEmployee,
            TruckMake = request.TruckMake,
            TruckYear = request.TruckYear,
            TruckModel = request.TruckModel,
            LicensePlate = request.LicensePlate,
            Status = request.Status ?? ApplicationStatus.Pending,
            IsActive = true
        };

        _db.DriverApplications.Add(application);
        await _db.SaveChangesAsync();

        return Created();
    }

    [HttpPost("{applicationId}/accept")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> AcceptApplication(int applicationId)
    {
        var authResult = await GetAuthorizedApplication(applicationId);
        if (authResult.Result is not null)
            return authResult.Result;

        var application = authResult.Application!;
        if (!application.DriverUserId.HasValue)
            return BadRequest("This application does not belong to a driver yet.");

        application.Status = ApplicationStatus.Accepted;
        application.IsActive = false;

        var driver = await _db.DriverUsers.Where(d => d.Id == application.DriverUserId.Value).SingleOrDefaultAsync();
        if (driver is null)
            return NotFound("Application's driver not found.");

        driver.SponsorOrgs.Add(application.SponsorOrg);

        await _db.SaveChangesAsync();
        await _auditLogger.CreateApplicationStatusChangeAuditLog(applicationId, "Accepted", null);
        await _alertsService.CreateSponsorshipChangeAlert(driver.Id, application.SponsorOrgId, DriverSponsorChangeType.Added);

        return Ok();
    }

    [HttpPost("{applicationId}/reject")]
    [Authorize(Policy = PolicyNames.AdminOrSponsor)]
    public async Task<ActionResult> RejectApplication([FromRoute] int applicationId, [FromBody] RejectApplicationModel request)
    {
        var authResult = await GetAuthorizedApplication(applicationId);
        if (authResult.Result is not null)
            return authResult.Result;

        var application = authResult.Application!;

        application.Status = ApplicationStatus.Rejected;
        application.IsActive = false;
        application.RejectionReason = request.Reason;

        await _db.SaveChangesAsync();
        await _auditLogger.CreateApplicationStatusChangeAuditLog(applicationId, "Rejected", request?.Reason);
        return Ok();
    }

    #region Helpers
    private async Task<(DriverApplication? Application, ActionResult? Result)> GetAuthorizedApplication(int applicationId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return (null, Unauthorized());

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        if (isSponsor && !await IsApplicationInSponsorUserOrg(applicationId, userId))
            return (null, NotFound());

        var application = await _db.DriverApplications
            .Include(a => a.SponsorOrg)
            .SingleOrDefaultAsync(a => a.Id == applicationId);

        if (application is null)
            return (null, NotFound());

        return (application, null);
    }

    private async Task<bool> IsApplicationInSponsorUserOrg(int applicationId, string sponsorUserId)
    {
        var sponsorOrgId = await _db.SponsorUsers
            .AsNoTracking()
            .Where(s => s.UserId == sponsorUserId)
            .Select(s => (int?)s.SponsorOrgId)
            .SingleOrDefaultAsync();

        if (!sponsorOrgId.HasValue)
            return false;

        return await _db.DriverApplications
            .AsNoTracking()
            .AnyAsync(a =>
                a.Id == applicationId &&
                a.SponsorOrgId == sponsorOrgId);
    }
    #endregion
}