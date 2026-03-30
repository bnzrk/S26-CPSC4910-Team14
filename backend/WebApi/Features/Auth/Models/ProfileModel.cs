namespace WebApi.Features.Auth.Models;

public class ProfileModel
{
    public bool IsAuthenticated { get; set; } = false;
    public UserModel? User { get; set; }
    public int? AdminId { get; set; }
    public int? SponsorId { get; set;}
    public int? DriverId { get; set; }
    public int? SponsorOrgId { get; set; }
    public bool IsImpersonating { get; set; } = false;
}