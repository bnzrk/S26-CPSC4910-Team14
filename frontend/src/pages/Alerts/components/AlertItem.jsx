import { useNavigate } from "react-router-dom";
import { ALERT_TYPES } from "@/constants/alertTypes";
import { StarIcon } from "lucide-react";
import BellIcon from "@/assets/icons/bell.svg?react";
import Button from "@/components/Button/Button";
import XIcon from "@/assets/icons/x.svg?react";
import styles from "./AlertItem.module.scss";
import clsx from "clsx";

function PointChangeAlertBody({ alert })
{
    const metadata = alert.metadata;
    const isPositive = alert.metadata.balanceChange > 0;
    return (
        <span>
            {metadata.sponsorName} {isPositive > 0 ? 'awared you' : 'deducted'} <span className={clsx(styles.inlinePoints, isPositive ? styles.positive : styles.negative)}>{metadata.balanceChange}<StarIcon /></span> points{isPositive ? '!' : '.'}
        </span>
    );
}

function formatTimestamp(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

export default function AlertItem({ alert, className })
{
    const navigate = useNavigate();

    return (
        <div className={clsx(styles.alert, className)}>
            <div className={styles.left}>
                <BellIcon className={styles.icon} />
                <div className={styles.body}>
                    <div className={styles.message}>
                        {alert.type == ALERT_TYPES.PointChange && <PointChangeAlertBody alert={alert} />}
                    </div>
                    <div className={styles.footer}>
                        {formatTimestamp(alert.timestampUtc)}
                    </div>
                </div>
            </div>
            <div className={styles.right}>
                {alert.type == ALERT_TYPES.PointChange && <Button text='View History' color='secondary' size='small' onClick={() => navigate("/driver/points")}/>}
                <button className={styles.dismiss}><XIcon /></button>
            </div>
        </div>
    )
}