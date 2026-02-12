using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApi.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTeamMemberNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 5);

            migrationBuilder.UpdateData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FirstName", "LastName", "Role" },
                values: new object[] { "Ben", "Nazaruk", "Team Lead" });

            migrationBuilder.UpdateData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "FirstName", "LastName", "Role" },
                values: new object[] { "Stella", "Herzberg", "Software Engineer" });

            migrationBuilder.UpdateData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "FirstName", "LastName", "Role" },
                values: new object[] { "Ella", "Patel", "Software Engineer" });

            migrationBuilder.UpdateData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "FirstName", "LastName", "Role" },
                values: new object[] { "Trey", "Larkins", "Software Engineer" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "FirstName", "LastName", "Role" },
                values: new object[] { "Trey", "Larkins", "Developer" });

            migrationBuilder.UpdateData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "FirstName", "LastName", "Role" },
                values: new object[] { "Member", "Two", "Developer" });

            migrationBuilder.UpdateData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "FirstName", "LastName", "Role" },
                values: new object[] { "Member", "Three", "Developer" });

            migrationBuilder.UpdateData(
                table: "TeamMembers",
                keyColumn: "Id",
                keyValue: 4,
                columns: new[] { "FirstName", "LastName", "Role" },
                values: new object[] { "Member", "Four", "Developer" });

            migrationBuilder.InsertData(
                table: "TeamMembers",
                columns: new[] { "Id", "AboutInfoId", "DisplayOrder", "FirstName", "LastName", "Role" },
                values: new object[] { 5, 1, 5, "Member", "Five", "Developer" });
        }
    }
}
