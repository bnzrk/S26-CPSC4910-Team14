using System.Text.Json;
using System.Text.Json.Serialization;


namespace WebApi.Features.Users.Models;

public class UserModel
{
    public required string Id { get; set; }
    public required string Email { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string UserType { get; set; }
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public DriverModel? Driver { get; set; }    
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public SponsorModel? Sponsor { get; set; }
}