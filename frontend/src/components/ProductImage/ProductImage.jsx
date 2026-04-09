import { useState, useRef, useEffect } from "react";
import styles from "./ProductImage.module.scss";
import ImageErrorIcon from "@/assets/icons/image-off.svg?react";
import clsx from "clsx";

export default function ProductImage({ className, src, alt })
{
    const placeholderSource = 'placehold.co';
    const isPlaceholderImage = src ? src.includes(placeholderSource) : true;

    useEffect(() =>
    {
        if (!src)
            return;

        const img = new Image();
        img.src = src;
    }, [src]);

    // Check if a placeholder image was returned
    const [showPlaceholder, setShowPlaceholder] = useState(isPlaceholderImage);
    const imgRef = useRef(null);

    // Then separately check for returned but broken images
    useEffect(() =>
    {
        const img = imgRef.current;
        if (!img) return;
        if (img.complete && img.naturalWidth === 0)
        {
            setShowPlaceholder(true);
        }
    }, [src]);

    return (
        !showPlaceholder ?
            <img
                className={clsx(className, styles.image)}
                src={src ?? ""}
                alt={alt}
            /> :
            <div className={clsx(className, styles.placeholder)}>
                <ImageErrorIcon />
            </div>

    );
}