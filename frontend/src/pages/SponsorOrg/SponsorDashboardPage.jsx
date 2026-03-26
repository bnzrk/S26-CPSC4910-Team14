import { useSponsorOrgDrivers } from '@/api/sponsorOrg';
import SponsorStatCards from './sections/SponsorStatCards';
import FleetChart from './sections/FleetChart';
import RewardBudget from './sections/RewardBudget';
import FleetAlerts from './sections/FleetAlerts';
import FleetMonitorTable from './sections/FleetMonitorTable';
import TopPerformers from './sections/TopPerformers';
import FleetHealth from './sections/FleetHealth';
import PointRulesSection from './sections/PointRulesSection';
import styles from './SponsorDashboardPage.module.scss';

export default function SponsorDashboardPage() {
  const { data: drivers = [] } = useSponsorOrgDrivers();

  return (
    <div className={styles.dashboard}>
      <SponsorStatCards driverCount={drivers.length} />

      <div className={styles.mainGrid}>
        <div className={styles.leftCol}>
          <FleetChart />
          <FleetMonitorTable />
        </div>
        <div className={styles.rightCol}>
          <RewardBudget />
          <FleetAlerts />
          <TopPerformers />
          <FleetHealth />
        </div>
      </div>

      <div className={styles.bottomRow}>
        <PointRulesSection />
      </div>
    </div>
  );
}
