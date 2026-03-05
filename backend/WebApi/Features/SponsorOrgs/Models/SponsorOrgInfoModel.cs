namespace WebApi.Features.SponsorOrgs.Models;

public class SponsorOrgInfoModel
{
    public required int Id { get; set; }
    public required string SponsorName { get; set; }
    public required DateTime DateJoined { get; set; }
    public required int SponsorCount { get; set; }
    public required int DriverCount { get; set; }
    public required decimal PointRatio { get; set; }
}