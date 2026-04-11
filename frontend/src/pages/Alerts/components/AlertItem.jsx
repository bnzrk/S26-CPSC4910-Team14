import { useNavigate } from "react-router-dom";
import { ALERT_TYPES, SPONSORSHIP_CHANGE_TYPE } from "@/constants/alertTypes";
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
        <span className={styles.pointChange}>
            {metadata.sponsorName} {isPositive > 0 ? 'awared you' : 'deducted'} <span className={clsx(styles.inlinePoints, isPositive ? styles.positive : styles.negative)}>{metadata.balanceChange}<StarIcon /></span> points{isPositive ? '!' : '.'}
        </span>
    );
}

function SponsorshipAlertBody({ alert })
{
    const metadata = alert.metadata;
    if (metadata.changeType == SPONSORSHIP_CHANGE_TYPE.Added)
        return <span>You are now a driver for <b className={styles.accent}>{metadata.sponsorName}</b>!</span>
    if (metadata.changeType == SPONSORSHIP_CHANGE_TYPE.Removed)
        return <span>You were <span className={styles.warn}>removed</span> from <b className={styles.accent}>{metadata.sponsorName}</b>.</span>
    return;
}

function OrderAlertBody({ alert })
{
    const metadata = alert.metadata;
    return <span>Order placed for <b className={styles.accent}>{metadata.itemSummary}</b> (Total: <span className={clsx(styles.inlinePoints, styles.accent)}>{metadata.pointTotal}<StarIcon /></span>).</span>
}

function formatTimestamp(date)
{
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
                        {alert.type == ALERT_TYPES.SponsorshipChange && <SponsorshipAlertBody alert={alert} />}
                        {alert.type == ALERT_TYPES.Order && <OrderAlertBody alert={alert} />}
                    </div>
                    <div className={styles.footer}>
                        {formatTimestamp(alert.timestampUtc)}
                    </div>
                </div>
            </div>
            <div className={styles.right}>
                {alert.type == ALERT_TYPES.PointChange && <Button text='View History' color='secondary' size='small' onClick={() => navigate("/driver/points")} />}
                {alert.type == ALERT_TYPES.Order && <Button text='View Order' color='secondary' size='small' onClick={() => navigate(`/orders/${alert.metadata.orderId}`)} />}
                <button className={styles.dismiss}><XIcon /></button>
            </div>
        </div>
    )
}