namespace WebApi.Data.Entities;

public class TechStackItem
{
    public int Id { get; set; }
    public int AboutInfoId { get; set; }
    public string Name { get; set; }
    public string Category { get; set; }
    public int DisplayOrder { get; set; }

    public AboutInfo AboutInfo { get; set; }
}
