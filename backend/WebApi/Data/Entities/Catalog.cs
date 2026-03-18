namespace WebApi.Data.Entities;

public class Catalog
{
    public int Id { get; set; }
    public int SponsorOrgId { get; set; }
    public SponsorOrg SponsorOrg { get; set; } = null!;
    
}