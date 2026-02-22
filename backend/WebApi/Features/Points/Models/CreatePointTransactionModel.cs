namespace WebApi.Features.Points.Models;

public class CreatePointTransactionModel
{
    public int DriverId { get; set; }
    public int BalanceChange { get; set; }
    public required string Reason { get; set; }
}