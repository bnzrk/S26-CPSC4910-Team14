namespace WebApi.Features.Auth.Models;

public class UpdateProfileModel
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
}