namespace WebApi.Data.Entities;

public class SponsorOrg
{
    public int Id { get; set; }
    public required string SponsorName { get; set; }
    public DateTime DateJoined { get; set; }
    public ICollection<SponsorUser> SponsorUsers { get; set; } = new List<SponsorUser>();
}