using WebApi.Features.DriverUsers.Models;
using WebApi.Helpers.Pagination;

namespace WebApi.Features.DriverUsers;

public interface IDriverUsersService
{
    Task<DriverUserModel?> GetByUserIdAsync(string userId);
    Task<DriverUserModel?> GetByIdAsync(int driverId);
    Task<List<SponsorOrgModel>> GetSponsorOrgsFromIdAsync(int driverId);
    Task<List<SponsorOrgModel>> GetSponsorOrgsFromUserIdAsync(string userId);
    Task<List<PointsModel>> GetPointsByUserIdAsync(string userId, int? orgId = null);
    Task<List<PointsModel>> GetPointsByIdAsync(int driverId, int? orgId = null, string? sponsorUserId = null);
    Task<PagedResult<PointTransactionModel>> GetPointTransactionsByIdAsync(
        int driverId,
        int? orgId = null,
        int page = 1,
        int pageSize = 20,
        string? sign = null,
        DateTime? from = null,
        DateTime? to = null);

    Task<PagedResult<PointTransactionModel>> GetPointTransactionsByUserIdAsync(
        string userId,
        int? orgId = null,
        int page = 1,
        int pageSize = 20,
        string? sign = null,
        DateTime? from = null,
        DateTime? to = null);
}