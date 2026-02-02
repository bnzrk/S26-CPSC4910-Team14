using Microsoft.AspNetCore.Mvc;

namespace TestApi.Controllers;

// Each controller will handle a single endpoint of our API.
// For example, we might have a controller for /users, /catalog, /drivers, etc. endpoints.

// This is a simple example of how a controller works in .NET
    
// Endpoint controllers need to be specified with [ApiController].
// [Route] lets you specify which endpoint it is for, in this case /hello.
[ApiController]
[Route("/hello")]
public class HelloController : ControllerBase
{
    // This function will be called when a GET request (with no parameters since we haven't specified any)
    // gets sent to /hello. This is specified with [HttpGet]. You can also use [HttpPost], etc.
    [HttpGet]
    public string GetHello()
    {
        // Just returns a simple string. Returns are automatically converted to JSON.
        return "Hello World!";
    }
}