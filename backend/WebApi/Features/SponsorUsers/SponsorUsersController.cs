using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using WebApi.Data.Entities;
using WebApi.Data.Enums;
using Microsoft.AspNetCore.Authorization;
using WebApi.Features.Users;
using Microsoft.EntityFrameworkCore;

namespace WebApi.Features.SponsorUsers;

[ApiController]
[Route("/sponsors")]
public class SponsorUsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly IUsersService _usersService;

    public SponsorUsersController(
        AppDbContext db, 
        UserManager<User> userManager, 
        IUsersService usersService)
    {
        _db = db;
        _userManager = userManager;
        _usersService = usersService;
    }
}
