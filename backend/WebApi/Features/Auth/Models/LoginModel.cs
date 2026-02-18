using System.ComponentModel.DataAnnotations;

namespace WebApi.Features.Auth.Models;

public class LoginModel
{
    [Required]
    public string Email { get; set; } = null!;
    [Required]
    public string Password { get; set; } = null!;
    public bool RememberMe { get; set; } = false;
}