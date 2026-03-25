import StarIcon from '@/assets/icons/star.svg?react';
import styles from './PointBadge.module.scss';
import clsx from 'clsx';

export default function PointBadge({ className, points })
{
    return (
        <div className={clsx(className, styles.badge)}>
            <StarIcon className={styles.icon} />
            <div className={styles.points}>{points}</div>
        </div>
    );
}