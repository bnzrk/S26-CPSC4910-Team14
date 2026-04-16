import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoints, usePointHistory } from '../../api/points';
import { useOrders } from '../../api/order';
import { useAlerts } from '../../api/alert';
import { useCatalog } from '../../api/catalog';
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
import Button from '@/components/Button/Button';

export default function DriverDashboardPage()
{
    const navigate = useNavigate();
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

    const startOfMonth = useMemo(() =>
        new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), []);

    const { data: monthlyTxns, isLoading: monthlyLoading } = usePointHistory({
        orgId: selectedOrgId, page: 1, pageSize: 1, sign: '+', from: startOfMonth,
    });
    const { data: orders, isLoading: ordersLoading } = useOrders({
        orgId: selectedOrgId, pageSize: 1,
    });
    const { data: alerts, isLoading: alertsLoading } = useAlerts();
    const { data: catalog, isLoading: catalogLoading, error: catalogError, refetch: refetchCatalog } = useCatalog(selectedOrgId);

    const hasError = (!pointsLoading && !!pointsError && !points) || (!historyLoading && !!historyError && !points);
    const balance = points?.balance ?? 0;

    return (
        <div className={styles.dashboard}>
            {hasError && (
                <InlineErrors errors={['Something went wrong loading your points.']} />
            )}

            <DashStatCards
                totalPoints={balance}
                transactionsThisMonth={monthlyTxns?.totalCount ?? null}
                transactionsLoading={monthlyLoading}
                ordersCount={orders?.totalCount ?? null}
                ordersLoading={ordersLoading}
                alertsCount={alerts?.length ?? null}
                alertsLoading={alertsLoading}
            />

            <div className={styles.mainGrid}>
                <div className={styles.leftCol}>
                    <PointsChart history={historyLoading ? null : history} />
                    <RecentDeliveriesTable history={historyLoading ? null : history} />
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
                <RedeemRewards
                    balance={balance}
                    catalog={catalog}
                    catalogLoading={catalogLoading}
                    catalogError={catalogError}
                    onRetry={refetchCatalog}
                />
            </div>
        </div>
        // <div className={styles.noOrg}>
        //     <div className={styles.promptWrapper}>
        //         <span>Apply to a sponsor to start earning rewards!</span>
        //         <Button color='primary' text='Apply Now' onClick={() => navigate("/apply")}/>
        //     </div>
        // </div>
    );
}
