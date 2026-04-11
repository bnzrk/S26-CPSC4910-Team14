using WebApi.Data.Entities;
using WebApi.Data.Enums;

namespace WebApi.Features.Alerts;

public interface IAlertsService
{
    public Task CreatePointTransactionAlert(PointTransaction transaction);
    public Task CreateSponsorshipChangeAlert(int driverId, int orgId, DriverSponsorChangeType changeType);
    public Task CreateOrderAlert(Order order);
}