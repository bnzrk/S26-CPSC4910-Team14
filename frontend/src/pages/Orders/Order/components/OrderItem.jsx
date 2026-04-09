import ProductImage from "@/components/ProductImage/ProductImage";
import PointBadge from "@/components/PointBadge/PointBadge";
import styles from "./OrderItem.module.scss";

export default function OrderItem({ item, quantity, className })
{
    return (
        <div className={styles.item}>
            <ProductImage className={styles.thumbnail} src={item?.thumbnailUrl ?? null} alt={item?.title} />
            <div className={styles.details}>
                <div className={styles.header}>
                    <div className={styles.title}>{item.title}</div>
                    <div className={styles.subtitle}>{item.category}</div>
                </div>
                <div className={styles.body}>
                    <div className={styles.quantity}>Quantity: {quantity ?? 0}</div>
                    <PointBadge className={styles.points} points={item.pricePoints}/>
                </div>
            </div>
        </div>
    );
}