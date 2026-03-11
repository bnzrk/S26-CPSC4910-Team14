using Microsoft.AspNetCore.Mvc;
using WebApi.Data.Enums;

namespace WebApi.Audit;

public interface IAuditLogger
{
    Task CreateLoginAuditLog(string email, bool successful);
    Task CreatePasswordChangeAuditLog(string userId, string email, PasswordChangeType type, bool successful);
}