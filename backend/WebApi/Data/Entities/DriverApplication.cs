using WebApi.Data.Enums;

namespace WebApi.Data.Entities;

public class DriverApplication
{
    public int Id { get; set; }
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!; 
    public DateOnly Birthday { get; set; }
    public bool PreviousEmployee { get; set; }
    public string TruckMake { get; set; } = null!;
    public int TruckYear { get; set; }
    public string TruckModel { get; set; } = null!;
    public string LicensePlate { get; set; } = null!;
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public bool IsActive { get; set; }
}
