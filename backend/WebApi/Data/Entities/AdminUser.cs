namespace WebApi.Data.Entities;

public class AdminUser
{
    public int Id { get; set; }
    public string UserId { get; set; }  
    public User User { get; set; }
}