using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace WebApi.Migrations.AuditDb
{
    /// <inheritdoc />
    public partial class AddPointTransactionAuditLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActorUserEmail",
                table: "DriverSponsorChangeAuditLogs",
                type: "longtext",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "ActorUserId",
                table: "DriverSponsorChangeAuditLogs",
                type: "longtext",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "DriverEmail",
                table: "DriverSponsorChangeAuditLogs",
                type: "longtext",
                nullable: false);

            migrationBuilder.AddColumn<string>(
                name: "SponsorOrgName",
                table: "DriverSponsorChangeAuditLogs",
                type: "longtext",
                nullable: false);

            migrationBuilder.CreateTable(
                name: "PointTransactionAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TimestampUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ActorUserId = table.Column<string>(type: "longtext", nullable: false),
                    ActorUserEmail = table.Column<string>(type: "longtext", nullable: false),
                    DriverId = table.Column<int>(type: "int", nullable: false),
                    DriverEmail = table.Column<string>(type: "longtext", nullable: false),
                    SponsorOrgId = table.Column<int>(type: "int", nullable: false),
                    SponsorOrgName = table.Column<string>(type: "longtext", nullable: false),
                    BalanceChange = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "longtext", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PointTransactionAuditLogs", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PointTransactionAuditLogs");

            migrationBuilder.DropColumn(
                name: "ActorUserEmail",
                table: "DriverSponsorChangeAuditLogs");

            migrationBuilder.DropColumn(
                name: "ActorUserId",
                table: "DriverSponsorChangeAuditLogs");

            migrationBuilder.DropColumn(
                name: "DriverEmail",
                table: "DriverSponsorChangeAuditLogs");

            migrationBuilder.DropColumn(
                name: "SponsorOrgName",
                table: "DriverSponsorChangeAuditLogs");
        }
    }
}
