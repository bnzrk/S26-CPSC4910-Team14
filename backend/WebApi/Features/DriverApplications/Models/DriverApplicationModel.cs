using WebApi.Data.Enums;

namespace WebApi.Features.DriverApplications.Models;

public class DriverApplicationModel
{
    public int Id { get; set; }
    public int? DriverUserId { get; set; }
    public int SponsorOrgId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public DateOnly? Birthday { get; set; }
    public bool? PreviousEmployee { get; set; }
    public string? TruckMake { get; set; }
    public int? TruckYear { get; set; }
    public string? TruckModel { get; set; }
    public string? LicensePlate { get; set; }
    public ApplicationStatus Status { get; set; }
    public bool IsActive { get; set; }
}