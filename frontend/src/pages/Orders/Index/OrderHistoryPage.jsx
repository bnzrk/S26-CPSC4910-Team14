import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import { useOrders } from "@/api/order";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import OrderHistoryItem from "./components/OrderHistoryItem";
import styles from "./OrderHistoryPage.module.scss"
import clsx from "clsx";

const TABS = {
    All: 0,
    Completed: 1,
    Cancelled: 2
}

export default function OrderHistoryPage()
{
    const { selectedOrgId } = useOrgContext();

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 0;

    const { data: orders, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders({ orgId: selectedOrgId });
    const cancelledOrders = useMemo(
        () => orders?.filter(order => order.status == 4) ?? [],
        [orders]
    );
    const completedOrders = useMemo(
    () => orders?.filter(order => order.status == 3) ?? [],
    [orders]);

    const displayedOrders = activeTab == TABS.All ? orders : activeTab == TABS.Completed ? completedOrders : activeTab == TABS.Cancelled ? cancelledOrders : [];

    const handleTabChange = (tab) =>
    {
        setSearchParams({ tab });
    };

    return (
        <CardHost>
            <Card title='Orders' className={styles.history}>
                <div className={styles.historyTabs}>
                    <button className={clsx(styles.tab, activeTab == TABS.All && styles.selected)} onClick={() => handleTabChange(TABS.All)}>
                        All
                    </button>
                    <button className={clsx(styles.tab, activeTab == TABS.Completed && styles.selected)} onClick={() => handleTabChange(TABS.Completed)}>
                        Completed
                    </button>
                    <button className={clsx(styles.tab, activeTab == TABS.Cancelled && styles.selected)} onClick={() => handleTabChange(TABS.Cancelled)}>
                        Canceled
                    </button>
                </div>
                <div className={styles.orders}>
                    {!isOrdersLoading && !isOrdersError && (!displayedOrders || displayedOrders?.length == 0) &&
                        <p className={styles.none}>No orders.</p>
                    }
                    {displayedOrders && displayedOrders?.length > 0 &&
                        displayedOrders.map((order) => <OrderHistoryItem key={order.id} order={order} />)
                    }
                </div>
            </Card>
        </CardHost>
    );
}