using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddSponsorOrgToDrivers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SponsorOrgId",
                table: "DriverUsers",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_DriverUsers_SponsorOrgId",
                table: "DriverUsers",
                column: "SponsorOrgId");

            migrationBuilder.AddForeignKey(
                name: "FK_DriverUsers_SponsorOrgs_SponsorOrgId",
                table: "DriverUsers",
                column: "SponsorOrgId",
                principalTable: "SponsorOrgs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DriverUsers_SponsorOrgs_SponsorOrgId",
                table: "DriverUsers");

            migrationBuilder.DropIndex(
                name: "IX_DriverUsers_SponsorOrgId",
                table: "DriverUsers");

            migrationBuilder.DropColumn(
                name: "SponsorOrgId",
                table: "DriverUsers");
        }
    }
}
