import { ORDER_STATUS } from "@/constants/orderStatuses";
import ProductImage from "@/components/ProductImage/ProductImage";
import StarIcon from "@/assets/icons/star.svg?react";
import styles from "./OrderHistoryItem.module.scss";
import clsx from "clsx";

const STATUS_LABELS = {
    0: "Pending",
    1: "Shipped",
    2: "Delivering",
    3: "Delivered",
    4: "Canceled"
}

const STATUS_CSS = {
    [ORDER_STATUS.Placed]: styles.pending,
    [ORDER_STATUS.Shipped]: styles.shipped,
    [ORDER_STATUS.OutForDelivery]: styles.shipped,
    [ORDER_STATUS.Delivered]: styles.completed,
};

export default function OrderHistoryItem({ order, onClick, className, other })
{
    const orderNumber = `#${String(order.id).padStart(5, '0')}`
    const thumbnailItem = order?.items[0] ?? null;
    const dateString = new Date(order.placedDateUtc).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const groupedItems = Object.values(
        order?.items.reduce((acc, item) =>
        {
            if (!acc[item.id]) acc[item.id] = { ...item, count: 0 };
            acc[item.id].count++;
            return acc;
        }, {})
    );

    const total = order.items.reduce((sum, item) => sum + item.pricePoints, 0);

    return (
        <div key={order.id} className={clsx(styles.item, className)} onClick={onClick} {...other}>
            <ProductImage className={styles.thumbnail} src={thumbnailItem?.thumbnailUrl ?? null} alt={thumbnailItem?.title} />
            <div className={styles.details}>
                <div className={styles.header}>
                    <div>Order {orderNumber}</div>
                    <div>Placed: {dateString}</div>
                </div>
                <div className={styles.body}>
                    <div className={clsx(styles.section, styles.products)}>
                        <label>Items</label>
                        <div className={styles.quantities}>
                            {groupedItems.map((item, i) => (
                                <span key={item.id} className={styles.itemQuantity}>
                                    <span className={styles.productName}>
                                        {item.title}
                                    </span>
                                    <span>
                                        &nbsp;x{item.count}
                                    </span>
                                    {i < groupedItems.length - 1 && (
                                        <span>, </span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className={styles.section}>
                        <label>Status</label>
                        <span className={clsx(STATUS_CSS[order.status], styles.statusBadge)}>{STATUS_LABELS[order.status] ?? 'N/A'}</span>
                    </div>
                    <div className={styles.section}>
                        <label>Total</label>
                        <span
                            className={clsx(styles.total)}>
                            {total} <StarIcon />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}