using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddUserTimestamps : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedDateUtc",
                table: "AspNetUsers",
                type: "datetime(6)",
                nullable: false,
                defaultValueSql: "CURRENT_TIMESTAMP(6)");

            migrationBuilder.AddColumn<DateTime>(
                name: "LastLoginUtc",
                table: "AspNetUsers",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "AboutInfos",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ReleaseDateUtc", "Version" },
                values: new object[] { new DateTime(2026, 3, 4, 0, 0, 0, 0, DateTimeKind.Utc), 5 });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreatedDateUtc",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "LastLoginUtc",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                table: "AboutInfos",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ReleaseDateUtc", "Version" },
                values: new object[] { new DateTime(2026, 2, 11, 0, 0, 0, 0, DateTimeKind.Utc), 2 });
        }
    }
}
