namespace WebApi.Data.Entities;

public class Feature
{
    public int Id { get; set; }
    public int AboutInfoId { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public string Icon { get; set; }
    public int DisplayOrder { get; set; }

    public AboutInfo AboutInfo { get; set; }
}
