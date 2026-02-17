namespace WebApi.Data.Enums;

public enum UserType
{
    Driver,
    Sponsor,
    Admin
}

public static class UserTypeRoles
{
    public static string Role(this UserType type) => type.ToString();
}