import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import { useOrders } from "@/api/order";
import PageControls from "@/components/PageControls/PageControls";
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

const HISTORY_SIZE = 10;

export default function OrderHistoryPage()
{
    const { selectedOrgId } = useOrgContext();

    const [page, setPage] = useState(1);

    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 0;

    const queryType = useMemo(
        () => activeTab == 0 ? "all" :
            activeTab == 1 ? "completed" :
                activeTab == 2 ? "cancelled" :
                    undefined,
        [activeTab]);

    const { data: ordersResult, isLoading: isOrdersLoading, isError: isOrdersError } = useOrders({ orgId: selectedOrgId, page: 1, pageSize: HISTORY_SIZE, type: queryType });
    const totalCount = ordersResult?.totalCount ?? 1;
    const totalPages = useMemo(() =>
    {
        if (!totalCount) return 1;
        return Math.max(1, Math.ceil(totalCount / HISTORY_SIZE));
    }, [totalCount]);

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
                <div>
                    {!isOrdersLoading && !isOrdersError && (!ordersResult || ordersResult.items?.length == 0) &&
                        <p className={styles.none}>No orders.</p>
                    }
                    {ordersResult && ordersResult.items?.length > 0 &&
                        <PageControls
                            showBookends={true}
                            page={page}
                            totalPages={totalPages}
                            onPrev={() => setPage(page > 1 ? page - 1 : 1)}
                            onNext={() => setPage(page < totalPages ? page + 1 : totalPages)}
                            onStart={() => setPage(1)}
                            onEnd={() => setPage(totalPages)}
                        >
                            <div className={styles.orders}>
                                {ordersResult.items.map((order) => <OrderHistoryItem key={order.id} order={order} />)}
                            </div>
                        </PageControls>
                    }
                </div>
            </Card>
        </CardHost>
    );
}