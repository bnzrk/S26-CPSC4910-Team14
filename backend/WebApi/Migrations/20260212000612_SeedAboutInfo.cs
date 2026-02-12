using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class SeedAboutInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "AboutInfos",
                columns: new[] { "Id", "ProductDescription", "ProductName", "ReleaseDateUtc", "Team", "Version" },
                values: new object[] { 1, "A rewards platform where sponsor companies award points to truck drivers for good driving behavior, redeemable for products from a sponsor-managed catalog.", "Good Driver Incentive Program", new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), 14, 2 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AboutInfos",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
