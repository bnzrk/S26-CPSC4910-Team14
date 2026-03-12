using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddDriverAndSponsorToApplications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DriverUserId",
                table: "DriverApplications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SponsorOrgId",
                table: "DriverApplications",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_DriverApplications_DriverUserId",
                table: "DriverApplications",
                column: "DriverUserId");

            migrationBuilder.CreateIndex(
                name: "IX_DriverApplications_SponsorOrgId",
                table: "DriverApplications",
                column: "SponsorOrgId");

            migrationBuilder.AddForeignKey(
                name: "FK_DriverApplications_DriverUsers_DriverUserId",
                table: "DriverApplications",
                column: "DriverUserId",
                principalTable: "DriverUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DriverApplications_SponsorOrgs_SponsorOrgId",
                table: "DriverApplications",
                column: "SponsorOrgId",
                principalTable: "SponsorOrgs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DriverApplications_DriverUsers_DriverUserId",
                table: "DriverApplications");

            migrationBuilder.DropForeignKey(
                name: "FK_DriverApplications_SponsorOrgs_SponsorOrgId",
                table: "DriverApplications");

            migrationBuilder.DropIndex(
                name: "IX_DriverApplications_DriverUserId",
                table: "DriverApplications");

            migrationBuilder.DropIndex(
                name: "IX_DriverApplications_SponsorOrgId",
                table: "DriverApplications");

            migrationBuilder.DropColumn(
                name: "DriverUserId",
                table: "DriverApplications");

            migrationBuilder.DropColumn(
                name: "SponsorOrgId",
                table: "DriverApplications");
        }
    }
}
