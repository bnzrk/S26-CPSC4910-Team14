namespace WebApi.Features.About.Models;

public class AboutInfoModel
{
    public int Team { get; set; }
    public int Version { get; set; }
    public DateTime ReleaseDateUtc { get; set; }
    public string ProductName { get; set; }
    public string ProductDescription { get; set; }
}