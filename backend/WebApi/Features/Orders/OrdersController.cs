using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WebApi.Data;
using WebApi.Data.Enums;
using WebApi.Data.Entities;
using WebApi.Features.Orders.Models;
using Microsoft.EntityFrameworkCore;
using WebApi.Features.Catalogs;
using WebApi.Helpers.Pagination;

namespace WebApi.Features.Orders;

[ApiController]
[Route("/orders")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly UserManager<User> _userManager;
    private readonly ICatalogsService _catalogService;

    private readonly HashSet<string> _orderQueryTypes = new HashSet<string> { "all", "completed", "cancelled" };

    public OrdersController(AppDbContext db, UserManager<User> userManager, ICatalogsService catalogService)
    {
        _db = db;
        _userManager = userManager;
        _catalogService = catalogService;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult> CreateOrder([FromBody] CreateOrderModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var orderDriver = await _db.DriverUsers
            .Include(d => d.SponsorOrgs)
            .Where(d => d.Id == request.DriverId)
            .SingleOrDefaultAsync();
        if (orderDriver is null)
            return NotFound("Driver not found.");

        var catalog = await _db.Catalogs
        .AsNoTracking()
        .Include(c => c.SponsorOrg)
        .Where(c => c.Id == request.CatalogId)
        .SingleOrDefaultAsync();
        if (catalog is null)
            return NotFound("Catalog not found.");

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isDriver = User.IsInRole(UserTypeRoles.Role(UserType.Driver));
        if (isDriver)
        {
            var userDriverId = await _db.DriverUsers.Where(d => d.UserId == userId).Select(d => (int?)d.Id).SingleOrDefaultAsync();
            if (!userDriverId.HasValue || userDriverId != orderDriver.Id)
                return NotFound("Cannot place an order for a different user.");
        }
        if (isSponsor)
        {
            // Get the sponsor user's org id
            var userOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (!userOrgId.HasValue)
                return BadRequest("Could not resolve user org.");
            // Ensure request catalog belongs to same org
            if (catalog.SponsorOrgId != userOrgId)
                return NotFound("Catalog not found.");
            // Ensure driver is in sposnor's org
            var isInOrg = orderDriver.SponsorOrgs.Any(o => o.Id == userOrgId.Value);
            if (!isInOrg)
                return NotFound("Driver not found.");
        }

        var canAccessCatalog = orderDriver.SponsorOrgs.Any(o => o.Id == catalog.SponsorOrgId);
        if (!canAccessCatalog)
            return NotFound("Catalog not found.");

        // Fetch matching catalog items
        var catalogItems = await _db.CatalogItems
            .Where(i => request.CatalogItemIds.Contains(i.Id))
            .ToListAsync();
        var catalogRatio = await _db.Catalogs
            .Include(c => c.SponsorOrg)
            .Where(c => c.Id == request.CatalogId)
            .Select(c => (decimal?)c.SponsorOrg.PointRatio)
            .SingleOrDefaultAsync();
        if (!catalogRatio.HasValue)
            return BadRequest("Unable to resolve org point value.");

        // Compare to request ids and return error if any missing
        foreach (var id in request.CatalogItemIds)
        {
            if (!catalogItems.Any(i => i.Id == id))
                return NotFound($"Catalog item with id {id} not found.");
        }
        // Validate catalog items to ensure items still available
        await _catalogService.RefreshItemCachesAsync(request.CatalogItemIds);
        foreach (var item in catalogItems)
        {
            if (!item.IsAvailable)
                return NotFound($"Catalog item with id {item.Id} is no longer available.");
        }

        await using var dbTransaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // Create order
            var order = new Order
            {
                SponsorOrgId = catalog.SponsorOrgId,
                DriverId = orderDriver.Id,
                Status = OrderStatus.Placed,
                PlacedDateUtc = DateTime.UtcNow
            };
            foreach (var id in request.CatalogItemIds)
            {
                var catalogItem = catalogItems.SingleOrDefault(i => i.Id == id);
                if (catalogItem is null)
                    return NotFound($"Catalog item with id {id} not found.");

                order.Items.Add(new OrderItem
                {
                    ThumbnailUrl = catalogItem.Images.FirstOrDefault() ?? "",
                    Title = catalogItem.Title,
                    Category = catalogItem.CategoryTitle,
                    Description = catalogItem.Description,
                    PricePoints = Convert.ToInt32(catalogItem.CatalogPrice / catalogRatio.Value),
                    PriceUsd = catalogItem.CatalogPrice,
                    VendorPriceUsd = catalogItem.ExternalPrice
                });
            }
            var orderTotal = order.Items.Sum(i => i.PricePoints);

            // Ensure driver has enough points to place order
            var driverPoints = await _db.PointTransactions
                .Where(t => t.SponsorOrgId == catalog.SponsorOrgId && t.DriverUserId == orderDriver.Id)
                .SumAsync(t => t.BalanceChange);
            if (driverPoints < orderTotal)
                return Ok(new CreateOrderResultModel
                {
                    Successful = false,
                    Error = "Not enough points."
                });

            // Deduct cost of order with point transaction
            var pointTransaction = new PointTransaction
            {
                SponsorOrgId = catalog.SponsorOrgId,
                DriverUserId = orderDriver.Id,
                BalanceChange = -orderTotal,
                Reason = "Redeemed",
                TransactionDateUtc = DateTime.UtcNow
            };
            _db.PointTransactions.Add(pointTransaction);
            _db.Orders.Add(order);
            await _db.SaveChangesAsync();

            await dbTransaction.CommitAsync();
            return Ok(new CreateOrderResultModel
            {
                OrderId = order.Id,
                Successful = true
            });
        }
        catch (Exception ex)
        {
            await dbTransaction.RollbackAsync();
            return BadRequest(ex.Message);
        }
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<PagedResult<OrderModel>>> GetOrders(
        [FromQuery] int? driverId,
        [FromQuery] int? orgId,
        [FromQuery] string? type,
        [FromQuery] int? pageSize,
        [FromQuery] int? page
        )
    {
        if (type is not null && !_orderQueryTypes.Contains(type))
            return BadRequest("Invalid order filter.");

        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isDriver = User.IsInRole(UserTypeRoles.Role(UserType.Driver));

        if (isDriver)
        {
            if (driverId.HasValue)
                return BadRequest("Drivers should not specify a driver id.");

            var userDriverId = await _db.DriverUsers.Where(d => d.UserId == userId).Select(d => (int?)d.Id).SingleOrDefaultAsync();
            driverId = userDriverId;
        }

        if (!isDriver && !driverId.HasValue)
            return BadRequest("Missing driver id.");

        var driver = await _db.DriverUsers
            .AsNoTracking()
            .Include(d => d.SponsorOrgs)
            .Where(d => d.Id == driverId)
            .SingleOrDefaultAsync();
        if (driver is null)
            return NotFound("Driver not found.");

        if (isSponsor)
        {
            if (orgId.HasValue)
                return BadRequest("Sponsors should not specific an org id.");

            // Get the sponsor user's org id
            var userOrgId = await _db.SponsorUsers.Where(s => s.UserId == userId).Select(s => (int?)s.SponsorOrgId).SingleOrDefaultAsync();
            if (!userOrgId.HasValue)
                return BadRequest("Could not resolve user org.");
            // Ensure driver is in sposnor's org
            var isInOrg = driver.SponsorOrgs.Any(o => o.Id == userOrgId.Value);
            if (!isInOrg)
                return NotFound("Driver not found.");

            orgId = userOrgId;
        }

        var orderQuery = _db.Orders
            .Where(o => o.DriverId == driverId);

        // Filter by org if specified 
        if (orgId.HasValue)
            orderQuery = orderQuery.Where(o => o.SponsorOrgId == orgId.Value);
        // Add any other query filters
        if (type is not null && type != "all")
        {
            switch (type)
            {
                case "completed":
                    orderQuery = orderQuery.Where(o => o.Status == OrderStatus.Delivered);
                    break;
                case "cancelled":
                    orderQuery = orderQuery.Where(o => o.Status == OrderStatus.Canceled);
                    break;
            }
        }
        orderQuery = orderQuery.OrderByDescending(o => o.PlacedDateUtc);

        var pageQuery = orderQuery.Select(o => new OrderModel
        {
            Id = o.Id,
            SponsorOrgId = o.SponsorOrgId,
            DriverId = o.DriverId,
            Status = o.Status,
            PlacedDateUtc = o.PlacedDateUtc,
            ShippeDateUtc = o.ShippeDateUtc,
            DeliveryStartDateUtc = o.DeliveryStartDateUtc,
            DeliveryCompleteDateUtc = o.DeliveryCompleteDateUtc,
            CanceledDateUtc = o.CanceledDateUtc,
            IsRefunded = o.IsRefunded,
            Items = o.Items.Select(i => new OrderItemModel
            {
                Id = i.Id,
                OrderId = i.OrderId,
                ThumbnailUrl = i.ThumbnailUrl,
                Title = i.Title,
                Category = i.Category,
                Description = i.Description,
                PricePoints = i.PricePoints,
                PriceUsd = i.PriceUsd,
                VendorPriceUsd = i.VendorPriceUsd
            }).ToList()
        });

        var queryPage = page is not null ? page.Value : 1;
        var queryPageSize = pageSize is not null ? pageSize.Value : 20;
        var results = await PagedResult.ToPagedResultAsync(pageQuery, queryPage, queryPageSize);

        return Ok(results);
    }

    [HttpPut("{orderId}/status")]
    [Authorize]
    public async Task<ActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusModel request)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var order = await _db.Orders.Include(o => o.Items).Where(o => o.Id == orderId).SingleOrDefaultAsync();
        if (order is null)
            return NotFound();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isDriver = User.IsInRole(UserTypeRoles.Role(UserType.Driver));
        if (isDriver)
        {
            var driverId = await _db.DriverUsers
                .AsNoTracking()
                .Where(d => d.UserId == userId)
                .Select(d => (int?)d.Id)
                .SingleOrDefaultAsync();
            if (!driverId.HasValue)
                throw new Exception("Could not resolve driver from user.");

            if (driverId != order.DriverId)
                return NotFound();
        }
        if (isSponsor)
        {
            var userOrgId = await _db.SponsorUsers
                .AsNoTracking()
                .Where(s => s.UserId == userId)
                .Select(s => (int?)s.SponsorOrgId)
                .SingleOrDefaultAsync();
            if (!userOrgId.HasValue)
                throw new Exception("Could not resolve org from user.");

            if (userOrgId != order.SponsorOrgId)
                return NotFound();
        }

        if (request.Status == OrderStatus.Canceled)
            return BadRequest("Invalid status.");

        SetOrderStatus(order, request.Status);
        await _db.SaveChangesAsync();

        return Ok();
    }

    [HttpPut("{orderId}/cancel")]
    [Authorize]
    public async Task<ActionResult> CancelOrder(int orderId)
    {
        var userId = _userManager.GetUserId(User);
        if (userId is null)
            return Unauthorized();

        var order = await _db.Orders.Include(o => o.Items).Where(o => o.Id == orderId).SingleOrDefaultAsync();
        if (order is null)
            return NotFound();

        var isSponsor = User.IsInRole(UserTypeRoles.Role(UserType.Sponsor));
        var isDriver = User.IsInRole(UserTypeRoles.Role(UserType.Driver));
        if (isDriver)
        {
            var driverId = await _db.DriverUsers
                .AsNoTracking()
                .Where(d => d.UserId == userId)
                .Select(d => (int?)d.Id)
                .SingleOrDefaultAsync();
            if (!driverId.HasValue)
                throw new Exception("Could not resolve driver from user.");

            if (driverId != order.DriverId)
                return NotFound();
        }
        if (isSponsor)
        {
            var userOrgId = await _db.SponsorUsers
                .AsNoTracking()
                .Where(s => s.UserId == userId)
                .Select(s => (int?)s.SponsorOrgId)
                .SingleOrDefaultAsync();
            if (!userOrgId.HasValue)
                throw new Exception("Could not resolve org from user.");

            if (userOrgId != order.SponsorOrgId)
                return NotFound();
        }

        if (order.Status == OrderStatus.Canceled)
        {
            return BadRequest("Order is already canceled.");
        }
        SetOrderStatus(order, OrderStatus.Canceled);

        // If not already refunded, refund points
        if (!order.IsRefunded)
        {
            Console.WriteLine("Adding refund transaction...");
            _db.PointTransactions.Add(new PointTransaction
            {
                DriverUserId = order.DriverId,
                SponsorOrgId = order.SponsorOrgId,
                BalanceChange = order.Items.Sum(i => i.PricePoints),
                TransactionDateUtc = DateTime.UtcNow,
                Reason = "Refund"
            });
            order.IsRefunded = true;
        }
        await _db.SaveChangesAsync();

        return Ok();
    }

    private void SetOrderStatus(Order order, OrderStatus status)
    {
        if (status != OrderStatus.Canceled)
            order.CanceledDateUtc = null;

        // Set status. If reverted to an earlier status, clear timestamps
        switch (status)
        {
            case OrderStatus.Placed:
                order.ShippeDateUtc = null;
                order.DeliveryStartDateUtc = null;
                order.DeliveryCompleteDateUtc = null;
                break;
            case OrderStatus.Shipped:
                order.ShippeDateUtc = DateTime.UtcNow;
                order.DeliveryStartDateUtc = null;
                order.DeliveryCompleteDateUtc = null;
                break;
            case OrderStatus.OutForDelivery:
                order.DeliveryStartDateUtc = DateTime.UtcNow;
                order.DeliveryCompleteDateUtc = null;
                break;
            case OrderStatus.Delivered:
                order.DeliveryCompleteDateUtc = DateTime.UtcNow;
                break;
            case OrderStatus.Canceled:
                order.CanceledDateUtc = DateTime.UtcNow;
                break;
            default:
                throw new Exception("Invalid status.");
        }
        order.Status = status;
    }
}