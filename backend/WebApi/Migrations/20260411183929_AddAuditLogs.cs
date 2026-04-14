using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditLogs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ApplicationStatusChangeAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TimestampUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ActorUserId = table.Column<string>(type: "longtext", nullable: false),
                    ActorUserEmail = table.Column<string>(type: "longtext", nullable: false),
                    ApplicationId = table.Column<int>(type: "int", nullable: false),
                    NewStatus = table.Column<string>(type: "longtext", nullable: false),
                    RejectionReason = table.Column<string>(type: "longtext", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationStatusChangeAuditLogs", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "CatalogChangeAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TimestampUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ActorUserId = table.Column<string>(type: "longtext", nullable: false),
                    ActorUserEmail = table.Column<string>(type: "longtext", nullable: false),
                    SponsorOrgId = table.Column<int>(type: "int", nullable: false),
                    ChangeType = table.Column<string>(type: "longtext", nullable: false),
                    ExternalItemId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CatalogChangeAuditLogs", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "DriverSponsorChangeAuditLogs",
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
                    ChangeType = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriverSponsorChangeAuditLogs", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "LoginAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    UserId = table.Column<string>(type: "longtext", nullable: true),
                    TimestampUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Email = table.Column<string>(type: "longtext", nullable: false),
                    Successful = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginAuditLogs", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "PasswordChangeAuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    TimestampUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ActorUserId = table.Column<string>(type: "longtext", nullable: false),
                    ActorUserEmail = table.Column<string>(type: "longtext", nullable: false),
                    TargetUserId = table.Column<string>(type: "longtext", nullable: false),
                    TargetUserEmail = table.Column<string>(type: "longtext", nullable: false),
                    ChangeType = table.Column<int>(type: "int", nullable: false),
                    Successful = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordChangeAuditLogs", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

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
                name: "ApplicationStatusChangeAuditLogs");

            migrationBuilder.DropTable(
                name: "CatalogChangeAuditLogs");

            migrationBuilder.DropTable(
                name: "DriverSponsorChangeAuditLogs");

            migrationBuilder.DropTable(
                name: "LoginAuditLogs");

            migrationBuilder.DropTable(
                name: "PasswordChangeAuditLogs");

            migrationBuilder.DropTable(
                name: "PointTransactionAuditLogs");
        }
    }
}
