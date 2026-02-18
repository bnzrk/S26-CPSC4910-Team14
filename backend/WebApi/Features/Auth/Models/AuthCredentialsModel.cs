namespace WebApi.Features.Auth.Models;

public class AuthCredentialsModel
{
    public bool IsAuthenticated { get; set; } = false;
    public UserModel? User { get; set; }
}