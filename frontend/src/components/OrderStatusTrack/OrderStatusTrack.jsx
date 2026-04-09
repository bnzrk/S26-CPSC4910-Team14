
import { ORDER_STATUS } from "@/constants/orderStatuses";
import ClipboardIcon from "@/assets/icons/clipboard-check.svg?react";
import PackageIcon from "@/assets/icons/package.svg?react";
import WarehouseIcon from "@/assets/icons/warehouse.svg?react";
import TruckIcon from "@/assets/icons/truck.svg?react";
import styles from "./OrderStatusTrack.module.scss";
import clsx from "clsx";

const STATUS_VISUALS = {
    0: { label: "Placed", icon: <ClipboardIcon /> },
    1: { label: "Shipped", icon: <WarehouseIcon /> },
    2: { label: "Out for Delivery", icon: <TruckIcon /> },
    3: { label: "Delivered", icon: <PackageIcon /> },
}

export default function OrderStatusTrack({ status, dates })
{
    return (
        <div className={styles.orderStatus}>
            <div className={styles.track}>
                {
                    Object.values(ORDER_STATUS).map((s) =>
                    {
                        if (s == ORDER_STATUS.Cancelled)
                            return;

                        const isComplete = status > s && status != ORDER_STATUS.Cancelled;
                        const isActive = s == status;

                        return (
                            <div key={s} className={clsx(styles.step)}>
                                <div className={clsx(styles.badge, (isComplete && !isActive) && styles.complete, isActive && styles.active)}>
                                    {STATUS_VISUALS[s].icon}
                                </div>
                                <div className={clsx(styles.label)}>
                                    <span className={clsx(styles.statusName, isActive && styles.active)}>{STATUS_VISUALS[s].label}</span>
                                    <span className={styles.statusDate}>{dates?.[s] ?? ''}</span>
                                </div>
                                <div className={styles.connector}>
                                    <div className={clsx(styles.fill, isComplete && styles.complete)} />
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </div>
    );
}