using WebApi.Data.Enums;

namespace WebApi.Audit;

public interface IAuditLogger
{
    Task CreateLoginAuditLog(string email, bool successful);
    Task CreatePasswordChangeAuditLog(string userId, string email, PasswordChangeType type, bool successful);
    Task CreateDriverSponsorChangeAuditLog(int driverId, string driverEmail, int orgId, string orgName, DriverSponsorChangeType type);
    Task CreatePointTransactionAuditLog(int driverId, string driverEmail, int orgId, string orgName, int balanceChange, string reason);
    Task CreateApplicationStatusChangeAuditLog(int applicationId, string newStatus, string? rejectionReason);
}