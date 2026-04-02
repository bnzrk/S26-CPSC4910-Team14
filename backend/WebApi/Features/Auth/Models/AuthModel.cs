namespace WebApi.Features.Auth.Models;

public class AuthModel
{
    public bool IsAuthenticated { get; set; } = false;
    public UserModel? User { get; set; }
}