using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class AddAboutChildTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Features",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    AboutInfoId = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "longtext", nullable: false),
                    Description = table.Column<string>(type: "longtext", nullable: false),
                    Icon = table.Column<string>(type: "longtext", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Features", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Features_AboutInfos_AboutInfoId",
                        column: x => x.AboutInfoId,
                        principalTable: "AboutInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TeamMembers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    AboutInfoId = table.Column<int>(type: "int", nullable: false),
                    FirstName = table.Column<string>(type: "longtext", nullable: false),
                    LastName = table.Column<string>(type: "longtext", nullable: false),
                    Role = table.Column<string>(type: "longtext", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TeamMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TeamMembers_AboutInfos_AboutInfoId",
                        column: x => x.AboutInfoId,
                        principalTable: "AboutInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TechStackItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    AboutInfoId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "longtext", nullable: false),
                    Category = table.Column<string>(type: "longtext", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TechStackItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TechStackItems_AboutInfos_AboutInfoId",
                        column: x => x.AboutInfoId,
                        principalTable: "AboutInfos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.UpdateData(
                table: "AboutInfos",
                keyColumn: "Id",
                keyValue: 1,
                column: "ProductName",
                value: "DrivePoints");

            migrationBuilder.InsertData(
                table: "Features",
                columns: new[] { "Id", "AboutInfoId", "Description", "DisplayOrder", "Icon", "Title" },
                values: new object[,]
                {
                    { 1, 1, "Drivers earn points for safe driving behavior, redeemable for real products from sponsor catalogs.", 1, "trophy", "Points & Rewards" },
                    { 2, 1, "Each sponsor manages a curated product catalog with real-time pricing from external APIs.", 2, "store", "Sponsor Catalogs" },
                    { 3, 1, "Comprehensive reports for sponsors and admins — track points, sales, and driver activity.", 3, "bar-chart-3", "Reporting & Analytics" },
                    { 4, 1, "Enterprise-grade security with encrypted data, audit logging, and role-based access control.", 4, "shield-check", "Security & Trust" }
                });

            migrationBuilder.InsertData(
                table: "TeamMembers",
                columns: new[] { "Id", "AboutInfoId", "DisplayOrder", "FirstName", "LastName", "Role" },
                values: new object[,]
                {
                    { 1, 1, 1, "Trey", "Larkins", "Developer" },
                    { 2, 1, 2, "Member", "Two", "Developer" },
                    { 3, 1, 3, "Member", "Three", "Developer" },
                    { 4, 1, 4, "Member", "Four", "Developer" },
                    { 5, 1, 5, "Member", "Five", "Developer" }
                });

            migrationBuilder.InsertData(
                table: "TechStackItems",
                columns: new[] { "Id", "AboutInfoId", "Category", "DisplayOrder", "Name" },
                values: new object[,]
                {
                    { 1, 1, "Frontend", 1, "React 19" },
                    { 2, 1, "Frontend", 2, "React Router 7" },
                    { 3, 1, "Frontend", 3, "React Query" },
                    { 4, 1, "Frontend", 4, "Vite 7" },
                    { 5, 1, "Frontend", 5, "SCSS Modules" },
                    { 6, 1, "Backend", 1, "ASP.NET Core 10" },
                    { 7, 1, "Backend", 2, "EF Core 10" },
                    { 8, 1, "Backend", 3, "C# 14" },
                    { 9, 1, "Database", 1, "MySQL 8" },
                    { 10, 1, "Cloud", 1, "AWS EC2" },
                    { 11, 1, "CI/CD", 1, "GitHub Actions" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Features_AboutInfoId",
                table: "Features",
                column: "AboutInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_TeamMembers_AboutInfoId",
                table: "TeamMembers",
                column: "AboutInfoId");

            migrationBuilder.CreateIndex(
                name: "IX_TechStackItems_AboutInfoId",
                table: "TechStackItems",
                column: "AboutInfoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Features");

            migrationBuilder.DropTable(
                name: "TeamMembers");

            migrationBuilder.DropTable(
                name: "TechStackItems");

            migrationBuilder.UpdateData(
                table: "AboutInfos",
                keyColumn: "Id",
                keyValue: 1,
                column: "ProductName",
                value: "Good Driver Incentive Program");
        }
    }
}
