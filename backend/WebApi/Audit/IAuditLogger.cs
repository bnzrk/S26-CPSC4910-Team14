using Microsoft.AspNetCore.Mvc;

namespace WebApi.Audit;

public interface IAuditLogger
{
    Task CreateLoginAuditLog(string email, bool successful);
}