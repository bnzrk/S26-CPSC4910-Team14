using System.ComponentModel.DataAnnotations;

namespace WebApi.Features.SponsorOrgs.Models;

public class CreateSponsorOrgModel
{
    [Required]
    public string SponsorName { get; set; } = null!;
}