namespace WebApi.Features.AdminUsers.Models;

public class UpdateUserModel
{
    public string Email { get; set; } = "";
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
}