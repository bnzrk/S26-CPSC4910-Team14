namespace WebApi.Features.About.Models;

public class AddTeamMemberModel
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Role { get; set; }
}