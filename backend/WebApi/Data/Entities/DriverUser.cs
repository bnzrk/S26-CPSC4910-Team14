namespace WebApi.Data.Entities;

public class DriverUser
{
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
}