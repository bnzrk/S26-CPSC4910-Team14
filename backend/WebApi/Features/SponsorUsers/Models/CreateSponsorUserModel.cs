using System.ComponentModel.DataAnnotations;

namespace WebApi.Features.SponsorUsers.Models;

public class CreateSponsorUserModel
{
    [Required]
    public string Email { get; set; } = null!;
    [Required]
    public string Password { get; set; } = null!;
    [Required]
    public string FirstName { get; set; } = null!;
    [Required]
    public string LastName { get; set; } = null!;
    [Required]
    public int SponsorOrgId { get; set; }
}