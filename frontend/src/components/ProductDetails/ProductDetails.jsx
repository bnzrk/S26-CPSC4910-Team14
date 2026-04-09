import { formatUsd } from "@/helpers/formatting";
import PointBadge from "../PointBadge/PointBadge";
import styles from "./ProductDetails.module.scss";
import clsx from "clsx";

export default function ProductDetails({ item, categoryTitle, price, points, showDescription = false, showRetail = true, showPrice = true, })
{
    return (
        <div className={styles.details}>
            <div className={styles.header}>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.subtitle}>{categoryTitle}</div>
                {showDescription && <span className={styles.description}>{item.description}</span>}
            </div>
            <div className={styles.prices}>
                {showRetail &&
                    <div className={clsx(styles.retail, styles.price)}>
                        <div>Retail Price</div>
                        <div>{formatUsd(item.price)}</div>
                    </div>
                }
                <div className={clsx(styles.catalog, styles.price)}>
                    {showPrice && <div>Catalog Price</div>} 
                    <div className={styles.row}>
                        {showPrice && <div>{formatUsd(price)}</div>}
                        <PointBadge
                            points={points}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}