using Microsoft.AspNetCore.Identity;
using WebApi.Data.Enums;

namespace WebApi.Data.Entities;

public class User : IdentityUser
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public UserType UserType { get; set; }
    public bool IsActive { get; set; }
}