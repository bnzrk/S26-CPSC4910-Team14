namespace WebApi.Features.DriverUsers.Models;

public class PointTransactionModel
{
    public int Id { get; set ;}
    public int DriverId { get; set; }
    public int SponsorOrgId { get; set; }
    public int BalanceChange { get; set; }
    public required string Reason { get; set; }
    public DateTime TransactionDateUtc { get; set; }
}