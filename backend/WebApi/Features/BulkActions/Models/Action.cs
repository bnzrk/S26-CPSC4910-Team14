namespace WebApi.Features.BulkActions;

public enum ActionType
{
    Org,
    Sponsor,
    Driver
}

public class Action
{
    public int Line { get; set; }
    public ActionType Type { get; set; }
    public string? OrgName { get; set; }
    public string? UserFirstName { get; set; }
    public string? UserLastName { get; set; }
    public string? UserEmail { get; set; }
    public int? PointTransactionAmount { get; set; }
    public string? PointTransactionReason { get; set; }

    public Action(int Line, ActionType Type, string? OrgName = null, string? UserFirstName = null, string? UserLastName = null, string? UserEmail = null, int? PointTransactionAmount = null, string? PointTransactionReason = null)
    {
        this.Line = Line;
        this.Type = Type;
        this.OrgName = OrgName;
        this.UserFirstName = UserFirstName;
        this.UserLastName = UserLastName;
        this.UserEmail = UserEmail;
        this.PointTransactionAmount = PointTransactionAmount;
        this.PointTransactionReason = PointTransactionReason;
    }
}