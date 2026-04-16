namespace WebApi.Features.SponsorOrgs.Models;

public class TopDriverModel
{
    public int Rank { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public int Points { get; set; }
    public bool IsCurrentUser { get; set; }
}
