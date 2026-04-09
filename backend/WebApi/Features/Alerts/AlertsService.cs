using WebApi.Data;
using WebApi.Data.Entities;

namespace WebApi.Features.Alerts;

public class AlertService : IAlertsService
{
    private readonly AppDbContext _db;

    public AlertService(AppDbContext db)
    {
        _db = db;
    }

    public async Task CreateOrderAlert(Order order)
    {
        throw new NotImplementedException();
    }

    public async Task CreatePointTransactionAlert(PointTransaction transaction)
    {
        var alert = new PointTransactionAlert
        {
            DriverId = transaction.DriverUserId,
            Transaction = transaction,
            TimestampUtc = transaction.TransactionDateUtc
        };

        _db.PointTransactionAlerts.Add(alert);
        await _db.SaveChangesAsync();
    }

    public async Task CreateSponsorshipChangeAlert(int driverId, int orgId)
    {
        throw new NotImplementedException();
    }
}