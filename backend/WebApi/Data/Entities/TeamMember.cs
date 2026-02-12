namespace WebApi.Data.Entities;

public class TeamMember
{
    public int Id { get; set; }
    public int AboutInfoId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Role { get; set; }
    public int DisplayOrder { get; set; }

    public AboutInfo AboutInfo { get; set; }
}
