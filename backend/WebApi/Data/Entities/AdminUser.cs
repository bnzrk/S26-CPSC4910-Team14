namespace WebApi.Data.Entities;

public class AdminUser
{
    public int Id { get; set; }
    public string UserId { get; set; } = null!;
    public User User { get; set; } = null!;
}