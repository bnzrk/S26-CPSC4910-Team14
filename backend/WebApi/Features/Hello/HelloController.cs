using Microsoft.AspNetCore.Mvc;

namespace WebApi.Hello;

[ApiController]
[Route("/hello")]
public class HelloController : ControllerBase
{
    // Returns a simple "Hello World!" string response.
    [HttpGet]
    public string GetHello()
    {
        return "Hello World!";
    }
}