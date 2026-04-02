using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace WebApi.Migrations.AuditDb
{
    /// <inheritdoc />
    public partial class AddCatalogChangeAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CatalogChangeAuditLogs");
        }
    }
}
