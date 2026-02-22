namespace WebApi.Data.Entities;

public class SponsorUser
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
    public int SponsorOrgId { get; set; }
    public SponsorOrg SponsorOrg { get; set; } = null!;
}