import { useAlerts, useDismissAlert, useDismissAllAlerts } from "@/api/alert";
import { BellOffIcon } from "lucide-react";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import Button from "@/components/Button/Button";
import AlertItem from "./components/AlertItem";
import styles from "./AlertsPage.module.scss";

export default function AlertsPage()
{
    const { data: alerts, isLoading: isAlertsLoading, isError: isAlertsError } = useAlerts();
    const dismissAlert = useDismissAlert();
    const dismissAllAlerts = useDismissAllAlerts();

    function onDismissAlert(alertId, alertType)
    {
        if (dismissAlert.isPending) return;
        dismissAlert.mutate({ alertId, alertType });
    }

    function onDismissAllAlerts()
    {
        if (dismissAllAlerts.isPending) return;
        dismissAllAlerts.mutate();
    }

    return (
        <CardHost>
            <Card title='Alerts'
                headerRight={
                    <div className={styles.header}>
                        {alerts?.length ? <div className={styles.badge}>{alerts.length}</div> : undefined}
                        <Button
                            text='Dismiss All'
                            icon={BellOffIcon}
                            color='secondary'
                            size='small'
                            onClick={onDismissAllAlerts}
                            disabled={!isAlertsLoading && (!alerts || alerts?.length == 0)}
                        />
                    </div>
                }>
                <div className={styles.alerts}>
                    {(!alerts || alerts.length == 0) && <p>You currently have no alerts.</p>}
                    {alerts && alerts.map((alert) =>
                        <AlertItem
                            key={`${alert.type}_${alert.id}`}
                            alert={alert}
                            onDismiss={() => onDismissAlert(alert.id, alert.type)}
                        />
                    )}
                </div>
            </Card>
        </CardHost>
    );
}