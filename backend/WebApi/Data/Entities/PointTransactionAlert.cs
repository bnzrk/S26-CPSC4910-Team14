namespace WebApi.Data.Entities;

public class PointTransactionAlert
{
    public int Id { get; set; }
    public int DriverId { get; set; }
    public DriverUser Driver { get; set; } = null!;
    public int TransactionId { get; set; }
    public PointTransaction Transaction { get; set; } = null!;
    public DateTime TimestampUtc {get; set; } = DateTime.UtcNow;
}