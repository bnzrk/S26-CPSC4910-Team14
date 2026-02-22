namespace WebApi.Features.Points.Models;

public class PointTransactionModel
{
    public int DriverId { get; set; }
    public int BalanceChange { get; set; }
    public required string Reason { get; set; }
}