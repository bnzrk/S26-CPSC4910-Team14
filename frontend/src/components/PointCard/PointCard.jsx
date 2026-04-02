import Button from '../Button/Button';
import StarIcon from '@/assets/icons/star.svg?react';
import styles from './PointCard.module.scss';
import clsx from 'clsx';

export default function PointCard({ className, onClick, points, dollarValue, ctaLabel, onCta }) {
  return (
    <div className={clsx(className, styles.card)} onClick={onClick}>
      <div className={styles.points}>
        <div className={styles.pointsLabel}>TOTAL POINTS</div>
        <div className={styles.pointsValue}>{points?.toLocaleString() ?? 0} <StarIcon /></div>
        {dollarValue && <div className={styles.dollarValue}>{dollarValue}</div>}
      </div>
      {ctaLabel && onCta && (
        <Button color="ghost" text={ctaLabel} onClick={onCta} className={styles.cta} />
      )}
    </div>
  );
}
