import { useAlerts } from "@/api/alert";
import { ALERT_TYPES } from "@/constants/alertTypes";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import AlertItem from "./components/AlertItem";
import styles from "./AlertsPage.module.scss";

export default function AlertsPage()
{
    const { data: alerts } = useAlerts();

    return (
        <CardHost>
            <Card title='Alerts'>
                <div className={styles.alerts}>
                    {!alerts && <p>No alerts.</p>}
                    {alerts && alerts.map((alert) => <AlertItem key={`${alert.type}_${alert.id}`} alert={alert} />)}
                </div>
            </Card>
        </CardHost>
    );
}