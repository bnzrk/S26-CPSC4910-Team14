import { useAlerts } from "@/api/alert";
import CardHost from "@/components/CardHost/CardHost";
import Card from "@/components/Card/Card";
import AlertItem from "./components/AlertItem";
import NavBadge from "@/components/NavBadge/NavBadge";
import styles from "./AlertsPage.module.scss";

export default function AlertsPage()
{
    const { data: alerts } = useAlerts();

    return (
        <CardHost>
            <Card title='Alerts' headerRight={alerts?.length ? <div className={styles.badge}>{alerts.length}</div> : undefined}>
                <div className={styles.alerts}>
                    {(!alerts || alerts.length == 0) && <p>You currently have no alerts.</p>}
                    {alerts && alerts.map((alert) => <AlertItem key={`${alert.type}_${alert.id}`} alert={alert} />)}
                </div>
            </Card>
        </CardHost>
    );
}