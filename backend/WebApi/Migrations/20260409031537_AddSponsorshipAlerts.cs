using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddSponsorshipAlerts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SponsorshipChangeAlerts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    SponsorOrgId = table.Column<int>(type: "int", nullable: false),
                    ChangeType = table.Column<int>(type: "int", nullable: false),
                    TimestampUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SponsorshipChangeAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SponsorshipChangeAlerts_DriverUsers_DriverId",
                        column: x => x.DriverId,
                        principalTable: "DriverUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SponsorshipChangeAlerts_SponsorOrgs_SponsorOrgId",
                        column: x => x.SponsorOrgId,
                        principalTable: "SponsorOrgs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_SponsorshipChangeAlerts_DriverId",
                table: "SponsorshipChangeAlerts",
                column: "DriverId");

            migrationBuilder.CreateIndex(
                name: "IX_SponsorshipChangeAlerts_SponsorOrgId",
                table: "SponsorshipChangeAlerts",
                column: "SponsorOrgId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SponsorshipChangeAlerts");
        }
    }
}
