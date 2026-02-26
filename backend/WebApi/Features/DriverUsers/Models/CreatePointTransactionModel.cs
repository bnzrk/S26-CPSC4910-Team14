namespace WebApi.Features.DriverUsers.Models;

public class CreatePointTransactionModel
{
    public int BalanceChange { get; set; }
    public required string Reason { get; set; }
}