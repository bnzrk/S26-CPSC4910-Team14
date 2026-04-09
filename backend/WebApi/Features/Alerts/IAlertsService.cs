using WebApi.Data.Entities;

namespace WebApi.Features.Alerts;

public interface IAlertsService
{
    public Task CreatePointTransactionAlert(PointTransaction transaction);
    public Task CreateSponsorshipChangeAlert(int driverId, int orgId);
    public Task CreateOrderAlert(Order order);
}