import Button from "../Button/Button";
import PrevIcon from "@/assets/icons/chevron-left.svg?react";
import NextIcon from "@/assets/icons/chevron-right.svg?react";
import StartIcon from "@/assets/icons/chevrons-left.svg?react";
import EndIcon from "@/assets/icons/chevrons-right.svg?react";
import styles from "./PageControls.module.scss";
import clsx from "clsx"

export default function PageControls({ page, totalPages, orientation = 'bottom', onPrev, onNext, showBookends = false, showBorder = false, onStart, onEnd, children, className })
{
    const canGoPrev = page > 1;
    const canGoNext = page < totalPages;

    return (
        <div className={clsx(className, styles.pageControls)}>
            {orientation != 'top' &&
                <div className={clsx(showBorder && styles.border, styles.content)}>
                    {children}
                </div>
            }
            <div className={styles.controls}>
                {showBookends && <Button className={styles.controlButton} icon={StartIcon} onClick={onStart} disabled={!canGoPrev} />}
                <Button className={styles.controlButton} icon={PrevIcon} onClick={onPrev} disabled={!canGoPrev} />
                <span className={styles.pageInfo}>
                    Page {totalPages > 0 ? page : 0} of {totalPages}
                </span>
                <Button className={styles.controlButton} icon={NextIcon} onClick={onNext} disabled={!canGoNext} />
                {showBookends && <Button className={styles.controlButton} icon={EndIcon} onClick={onEnd} disabled={!canGoNext} />}
            </div>
            {orientation == 'top' &&
                <div className={clsx(showBorder && styles.border, styles.content)}>
                    {children}
                </div>
            }
        </div>
    );
}