namespace WebApi.Features.About.Models;

public class AboutInfoModel
{
    public int TeamNumber { get; set; }
    public string VersionNumber { get; set; }
    public DateTime ReleaseDate { get; set; }
    public string ProductName { get; set; }
    public string ProductDescription { get; set; }
    public List<TeamMemberModel> TeamMembers { get; set; }
    public List<FeatureModel> Features { get; set; }
    public List<TechStackItemModel> TechStack { get; set; }

    public class TeamMemberModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }
    }

    public class FeatureModel
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string Icon { get; set; }
    }

    public class TechStackItemModel
    {
        public string Name { get; set; }
        public string Category { get; set; }
    }
}
