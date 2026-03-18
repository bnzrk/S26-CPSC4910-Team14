using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class RequireCatalogOrgId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Catalogs_SponsorOrgs_SponsorOrgId",
                table: "Catalogs");

            migrationBuilder.AlterColumn<int>(
                name: "SponsorOrgId",
                table: "Catalogs",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Catalogs_SponsorOrgs_SponsorOrgId",
                table: "Catalogs",
                column: "SponsorOrgId",
                principalTable: "SponsorOrgs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Catalogs_SponsorOrgs_SponsorOrgId",
                table: "Catalogs");

            migrationBuilder.AlterColumn<int>(
                name: "SponsorOrgId",
                table: "Catalogs",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddForeignKey(
                name: "FK_Catalogs_SponsorOrgs_SponsorOrgId",
                table: "Catalogs",
                column: "SponsorOrgId",
                principalTable: "SponsorOrgs",
                principalColumn: "Id");
        }
    }
}
