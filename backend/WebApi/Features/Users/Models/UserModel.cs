using System.Text.Json.Serialization;
using WebApi.Data.Enums;


namespace WebApi.Features.Users.Models;

public class UserModel
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required UserType UserType { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public DriverModel? Driver { get; set; }    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public SponsorModel? Sponsor { get; set; }
}