namespace WebApi.Features.Catalogs.Models;

public class CatalogSpendModel
{
    public required int MonthlyPointsIssued { get; set; }
    public required int MonthlyPointsSpent { get; set; }
    public required decimal MonthlyUsdSpent { get; set; }
    public required decimal MonthlyExpensesUsd { get; set; }
}