namespace WebApi.Data.Entities;

public class AboutInfo
{
    public int Id { get; set; }
    public int Team { get; set; }
    public int Version { get; set; }
    public DateTime ReleaseDateUtc { get; set; }
    public string ProductName { get; set; }
    public string ProductDescription { get; set; }

    public ICollection<TeamMember> TeamMembers { get; set; }
    public ICollection<Feature> Features { get; set; }
    public ICollection<TechStackItem> TechStackItems { get; set; }
}
