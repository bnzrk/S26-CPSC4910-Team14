namespace WebApi.Features.PointTransactions.Models;

public class PointTransactionModel
{
    public required int DriverId { get; set; }
    public required string DriverName { get; set; }
    public required string DriverEmail { get; set; }
    public required int DriverTotalPoints { get; set; }
    public required int BalanceChange { get; set; }
    public required string Reason { get; set; }
    public required DateTime TransactionDateUtc { get; set; }
    public required string SponsorName { get; set; }
}