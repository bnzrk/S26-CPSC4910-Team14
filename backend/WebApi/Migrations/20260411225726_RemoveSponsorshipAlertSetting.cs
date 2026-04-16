using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class RemoveSponsorshipAlertSetting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSponsorshipAlertsEnabled",
                table: "DriverAlertSettings");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSponsorshipAlertsEnabled",
                table: "DriverAlertSettings",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
