namespace WebApi.Features.DriverUsers.Models;

public class DriverUserModel
{
    public required int Id { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required DateTime DateCreatedUtc { get; set; }
    public required DateTime? LastLoginUtc { get; set; }
}