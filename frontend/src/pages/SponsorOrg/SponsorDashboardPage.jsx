import { useSponsorOrgDrivers } from '@/api/sponsorOrg';
import { useMonthlySaleSummary, useSixMonthSummary } from '@/api/sales';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import { DEFAULT_BUDGET_CAP } from '@/constants/budget';
import SponsorStatCards from './sections/SponsorStatCards';
import FleetChart from './sections/FleetChart';
import RewardBudget from './sections/RewardBudget';
import FleetAlerts from './sections/FleetAlerts';
import FleetMonitorTable from './sections/FleetMonitorTable';
import TopPerformers from './sections/TopPerformers';
import FleetHealth from './sections/FleetHealth';
import PointRulesSection from './sections/PointRulesSection';
import styles from './SponsorDashboardPage.module.scss';

function getTrendPercent(current, previous)
{    
  if (previous == 0)
    return current > 0 ? 100 : 0;

  return Math.round((current - previous) / previous * 100, 1);
}

export default function SponsorDashboardPage()
{
  const { data: driversPage } = useSponsorOrgDrivers();
  const drivers = driversPage?.items ?? [];
  const driverCount = driversPage?.totalCount ?? drivers.length;

  const { selectedOrgId } = useOrgContext();

  // Monthly summary
  const { data: summary, isLoading: isSummaryLoading, isError: isSummaryError } = useMonthlySaleSummary();
  const pointsTrend = summary ? getTrendPercent(summary.pointsIssued, summary.prevPointsIssued) : 0;
  const expenseTrend = summary ? getTrendPercent(summary.expenses, summary.prevExpenses) : 0;
  const percentBudgetUsed = summary ? Math.round(((summary.expenses + summary.pendingExpenses) / DEFAULT_BUDGET_CAP) * 100) : 0;

  // Six month summary
  const { data: sixMonthSummary } = useSixMonthSummary();

  return (
    <div className={styles.dashboard}>
      <SponsorStatCards
        driverCount={driverCount}
        pointsIssued={summary?.pointsIssued}
        pointsIssuedTrend={pointsTrend}
        rewardsPaid={summary?.expenses}
        rewardsPaidTrend={expenseTrend}
      />

      <div className={styles.mainGrid}> 
        <div className={styles.leftCol}>
          <FleetChart driverCount={driverCount} summary={sixMonthSummary} budgetUsedPercent={percentBudgetUsed} />
          <FleetMonitorTable />
          <PointRulesSection />
        </div>
        <div className={styles.rightCol}>
          <RewardBudget paidOut={summary?.expenses} pending={summary?.pendingExpenses} cap={DEFAULT_BUDGET_CAP}/>
          <TopPerformers />
          <FleetHealth />
          <FleetAlerts />
        </div>
      </div>

      <div className={styles.bottomRow}>
      </div>
    </div>
  );
}
