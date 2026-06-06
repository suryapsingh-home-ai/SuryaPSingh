using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace PersonalWebsite.Services;

public class AdminAuthService(IConfiguration config)
{
    public async Task<bool> SignInAsync(HttpContext httpContext, string username, string password)
    {
        var adminUser = config["Admin:Username"] ?? "admin";
        var adminPass = config["Admin:Password"] ?? "ChangeMe123!";

        if (username != adminUser || password != adminPass)
            return false;

        var claims = new List<Claim>
        {
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Role, "Admin")
        };

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        await httpContext.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal,
            new AuthenticationProperties
            {
                IsPersistent = true,
                ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8)
            });

        return true;
    }

    public Task SignOutAsync(HttpContext httpContext) =>
        httpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
}
