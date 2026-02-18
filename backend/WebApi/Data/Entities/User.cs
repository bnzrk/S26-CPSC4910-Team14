using Microsoft.AspNetCore.Identity;
using WebApi.Data.Enums;

namespace WebApi.Data.Entities;

public class User : IdentityUser
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public UserType UserType { get; set; }
    public bool IsActive { get; set; }
}