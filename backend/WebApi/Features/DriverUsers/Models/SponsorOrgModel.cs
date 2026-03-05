namespace WebApi.Features.DriverUsers.Models;

public class SponsorOrgModel
{
    public required int Id { get; set; }
    public required string SponsorName { get; set; }
    public required decimal PointRatio { get; set; }
}