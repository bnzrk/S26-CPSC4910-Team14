using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class ChangeDriverOrgRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DriverUsers_SponsorOrgs_SponsorOrgId",
                table: "DriverUsers");

            migrationBuilder.DropIndex(
                name: "IX_DriverUsers_SponsorOrgId",
                table: "DriverUsers");

            migrationBuilder.CreateTable(
                name: "DriverUserSponsorOrg",
                columns: table => new
                {
                    DriverUserId = table.Column<int>(type: "int", nullable: false),
                    SponsorOrgId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DriverUserSponsorOrg", x => new { x.DriverUserId, x.SponsorOrgId });
                    table.ForeignKey(
                        name: "FK_DriverUserSponsorOrg_DriverUsers_DriverUserId",
                        column: x => x.DriverUserId,
                        principalTable: "DriverUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DriverUserSponsorOrg_SponsorOrgs_SponsorOrgId",
                        column: x => x.SponsorOrgId,
                        principalTable: "SponsorOrgs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_DriverUserSponsorOrg_SponsorOrgId",
                table: "DriverUserSponsorOrg",
                column: "SponsorOrgId");

            migrationBuilder.Sql(@"
                INSERT IGNORE INTO DriverUserSponsorOrg (DriverUserId, SponsorOrgId)
                SELECT Id, SponsorOrgId
                FROM DriverUsers
                WHERE SponsorOrgId IS NOT NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DriverUserSponsorOrg");

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
    }
}
