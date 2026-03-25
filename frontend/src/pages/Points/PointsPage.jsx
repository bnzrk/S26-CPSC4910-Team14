import { usePoints, usePointHistory } from '../../api/points';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import DashStatCards from './sections/DashStatCards';
import PointsChart from './sections/PointsChart';
import NextDelivery from './sections/NextDelivery';
import MonthlyGoal from './sections/MonthlyGoal';
import DeliveryStreak from './sections/DeliveryStreak';
import RecentDeliveriesTable from './sections/RecentDeliveriesTable';
import FleetLeaderboard from './sections/FleetLeaderboard';
import ActiveChallenges from './sections/ActiveChallenges';
import RedeemRewards from './sections/RedeemRewards';
import ActivityFeed from './sections/ActivityFeed';
import styles from './PointsPage.module.scss';

export default function PointsPage() {
  const { selectedOrgId } = useOrgContext();
  const { data: points } = usePoints(selectedOrgId);
  const { data: history } = usePointHistory({
    orgId: selectedOrgId,
    page: 1,
    pageSize: 20,
  });

  return (
    <div className={styles.dashboard}>
      <DashStatCards
        totalPoints={points?.balance}
        deliveriesThisMonth={47}
        fleetRank="#3"
        onTimeRate="96%"
      />

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <PointsChart history={history} />
          <RecentDeliveriesTable history={history} />
        </div>
        <div className={styles.rightCol}>
          <NextDelivery />
          <MonthlyGoal currentPoints={points?.balance} goalPoints={2000} />
          <DeliveryStreak />
          <FleetLeaderboard />
        </div>
      </div>

      <div className={styles.bottomRow}>
        <ActiveChallenges />
        <RedeemRewards balance={points?.balance} />
        <ActivityFeed history={history} />
      </div>
    </div>
  );
}
