import { useState, useRef, useEffect } from "react";
import ImageErrorIcon from "@/assets/icons/image-off.svg?react";
import PointBadge from "@/components/PointBadge/PointBadge";
import styles from "./ShopItem.module.scss";
import clsx from 'clsx';

export default function ShopItem({ title, category, imageUrl, alt, price, points, available = true, className, children, onClick, ...other })
{
    const formatUsd = (price) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

    const placeholderSource = 'placehold.co';
    const isPlaceholderImage = imageUrl.includes(placeholderSource);

    useEffect(() =>
    {
        const img = new Image();
        img.src = imageUrl;
    }, [imageUrl]);

    // Check if a placeholder image was returned
    const [failed, setFailed] = useState(isPlaceholderImage);
    const imgRef = useRef(null);

    // Then separately check for returned but broken images
    useEffect(() =>
    {
        const img = imgRef.current;
        if (!img) return;
        if (img.complete && img.naturalWidth === 0)
        {
            setFailed(true);
        }
    }, [imageUrl]);

    const availableStyle = available ? '' : styles.unavailable

    return (
        <div
            {...other}
            className={clsx(availableStyle, styles.shopItem)}
        >
            <div className={clsx(styles.itemBody, onClick && styles.clickable)} onClick={onClick}>
                <div className={styles.thumbnail}>
                    {(!failed) &&
                        <img
                            key={imageUrl}
                            ref={imgRef}
                            src={imageUrl}
                            alt={title}
                            onError={(e) =>
                            {
                                e.currentTarget.onerror = null;
                                setFailed(true);
                            }}
                        />
                    }
                    {(failed) &&
                        <div className={styles.placeholder}>
                            <ImageErrorIcon />
                        </div>
                    }
                </div>
                <div className={styles.details}>
                    <div className={styles.header}>
                        <div className={styles.title}>{title}</div>
                        <div className={styles.subtitle}>{category}</div>
                    </div>
                    <div className={styles.price}>
                        {price && formatUsd(price)}
                        {points && <PointBadge className={styles.points} points={points} />}
                    </div>
                </div>
            </div>
            <div className={styles.footer}>
                {children}
            </div>
        </div>
    )
}