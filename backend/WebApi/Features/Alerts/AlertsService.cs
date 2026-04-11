using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;

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
        var alert = new OrderAlert
        {
            DriverId = order.DriverId,
            OrderId = order.Id,
            TimestampUtc = DateTime.UtcNow
        };

        _db.OrderAlerts.Add(alert);
        await _db.SaveChangesAsync();
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

    public async Task CreateSponsorshipChangeAlert(int driverId, int orgId, DriverSponsorChangeType changeType)
    {
        var alert = new SponsorshipChangeAlert
        {
            DriverId = driverId,
            SponsorOrgId = orgId,
            ChangeType = changeType,
            TimestampUtc = DateTime.UtcNow
        };

        _db.SponsorshipChangeAlerts.Add(alert);
        await _db.SaveChangesAsync();
    }
}