namespace WebApi.Features.Auth.Models;

public class UpdatePasswordModel
{
    public required string CurrentPassword { get; set; }
    public required string NewPassword { get; set; }
}