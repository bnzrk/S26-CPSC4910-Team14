using Microsoft.AspNetCore.Identity;
using WebApi.Data.Entities;

namespace WebApi.Features.Users;

public interface IUsersService
{
    // Attempts to create a new admin user and returns the result.
    public Task<IdentityResult> CreateAdminUser(string email, string password, string firstName, string lastName);
    // Attemps to create a new sponsor user and returns the result.
    public Task<IdentityResult> CreateSponsorUser(string email, string password, string firstName, string lastName, SponsorOrg org);
    // Deactivates the specified user.
    public Task<bool> SetUserActive(User user, bool active);
    // Permanently deletes a user.
    public Task<IdentityResult> DeleteUser(User user);
}