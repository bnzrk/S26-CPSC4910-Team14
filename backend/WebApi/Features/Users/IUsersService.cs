using Microsoft.AspNetCore.Identity;
using WebApi.Data.Entities;
using WebApi.Data.Enums;

namespace WebApi.Features.Users;

public interface IUsersService
{
    // Attempts to create a new admin user and returns the result.
    public Task<IdentityResult> CreateAdminUser(string email, string password, string firstName, string lastName);
    // Attemps to create a new sponsor user and returns the result.
    public Task<IdentityResult> CreateSponsorUser(string email, string password, string firstName, string lastName, SponsorOrg org);
    public Task<IdentityResult> CreateSponsorUser(string email, string password, string firstName, string lastName, int orgId);
    // Attempts to create a new driver user and returns the result.
    public Task<IdentityResult> CreateDriverUser(string email, string password, string firstName, string lastName, SponsorOrg? org = null);
    
    // Password editing
    Task<IdentityResult> UpdateUserAsync(string userId, string email, string firstName, string lastName);
    Task<IdentityResult> ChangeUserPasswordAsync(string userId, string newPassword, PasswordChangeType changeType);
    
    // Deactivates the specified user.
    public Task<bool> SetUserActive(User user, bool active);
    // Permanently deletes a user.
    public Task<IdentityResult> DeleteUser(User user);
}