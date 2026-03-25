import StarIcon from '@/assets/icons/star.svg?react';
import styles from './PointBadge.module.scss';

export default function PointBadge({ points })
{
    return (
        <div className={styles.badge}>
            <StarIcon className={styles.icon} />
            <div className={styles.points}>{points}</div>
        </div>
    );
}