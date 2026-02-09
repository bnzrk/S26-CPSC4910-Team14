using System.ComponentModel.DataAnnotations.Schema;

namespace WebApi.Data.Entities;

[Table("AboutInfo")]
public class AboutInfo
{
    public int Id { get; set; }
    public int Team { get; set; }
    public int Version { get; set; }
    public DateTime ReleaseDateUtc { get; set; }
    public string ProductName { get; set; }
    public string ProductDescription { get; set; }
}