import { formatUsd } from "@/helpers/formatting";
import PointBadge from "../PointBadge/PointBadge";
import styles from "./ProductDetails.module.scss";
import clsx from "clsx";

export default function ProductDetails({ item, categoryTitle, price, points })
{
    return (
        <div className={styles.details}>
            <div className={styles.header}>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.subtitle}>{categoryTitle}</div>
            </div>
            <div className={styles.prices}>
                <div className={clsx(styles.retail, styles.price)}>
                    <div>Retail Price</div>
                    <div>{formatUsd(item.price)}</div>
                </div>
                <div className={clsx(styles.catalog, styles.price)}>
                    <div>Catalog Price</div>
                    <div className={styles.row}>
                        <div>{formatUsd(price)}</div>
                        <PointBadge
                            points={points}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}