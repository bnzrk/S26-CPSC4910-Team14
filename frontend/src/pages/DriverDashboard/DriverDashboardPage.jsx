import { useMemo } from 'react';
import { usePoints, usePointHistory } from '../../api/points';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import InlineErrors from '@/components/InlineErrors/InlineErrors';
import styles from './DriverDashboardPage.module.scss';

import DashStatCards from './sections/DashStatCards';
import PointsChart from './sections/PointsChart';
import RecentDeliveriesTable from './sections/RecentDeliveriesTable';
import NextDelivery from './sections/NextDelivery';
import MonthlyGoal from './sections/MonthlyGoal';
import DeliveryStreak from './sections/DeliveryStreak';
import FleetLeaderboard from './sections/FleetLeaderboard';
import ActiveChallenges from './sections/ActiveChallenges';
import RedeemRewards from './sections/RedeemRewards';
import ActivityFeed from './sections/ActivityFeed';

export default function DriverDashboardPage()
{
    const { selectedOrgId, driverOrgs } = useOrgContext();

    const org = useMemo(() =>
    {
        if (!selectedOrgId) return null;
        return (driverOrgs ?? []).find(o => String(o.id) === String(selectedOrgId)) ?? null;
    }, [driverOrgs, selectedOrgId]);

    const {
        data: points,
        isLoading: pointsLoading,
        error: pointsError,
    } = usePoints(selectedOrgId);

    const {
        data: history,
        isLoading: historyLoading,
        error: historyError,
    } = usePointHistory({
        orgId: selectedOrgId,
        page: 1,
        pageSize: 50,
    });

    const hasError = !!pointsError || !!historyError;
    const balance = points?.balance ?? 0;

    return (
        <div className={styles.dashboard}>
            {hasError && (
                <InlineErrors errors={['Something went wrong loading your points.']} />
            )}

            <DashStatCards totalPoints={balance} />

            <div className={styles.mainGrid}>
                <div className={styles.leftCol}>
                    <PointsChart history={history} />
                    <RecentDeliveriesTable history={history} />
                </div>

                <div className={styles.rightCol}>
                    <NextDelivery />
                    <MonthlyGoal currentPoints={Math.max(0, balance)} />
                    <DeliveryStreak />
                    <FleetLeaderboard />
                </div>
            </div>

            <div className={styles.bottomRow}>
                <ActiveChallenges />
                <ActivityFeed history={historyLoading ? null : history} />
            </div>
        </div>
    );
}
