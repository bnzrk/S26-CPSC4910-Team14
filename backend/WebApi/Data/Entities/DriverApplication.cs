using WebApi.Data.Enums;

namespace WebApi.Data.Entities;

public class DriverApplication
{
    public int Id { get; set; }
    public int? DriverUserId { get; set; }
    public DriverUser? DriverUser { get; set; }
    public int SponsorOrgId { get; set; }
    public SponsorOrg SponsorOrg { get; set; } = null!;
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PhoneNumber { get; set; }
    public DateOnly? Birthday { get; set; }
    public bool? PreviousEmployee { get; set; }
    public string? TruckMake { get; set; }
    public int? TruckYear { get; set; }
    public string? TruckModel { get; set; }
    public string? LicensePlate { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public bool IsActive { get; set; }
    public string? RejectionReason { get; set; }
}
