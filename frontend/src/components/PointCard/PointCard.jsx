import Button from '../Button/Button';
import styles from './PointCard.module.scss';

export default function PointCard({ points, dollarValue, ctaLabel, onCta }) {
  return (
    <div className={styles.card}>
      <div className={styles.points}>
        <div className={styles.pointsLabel}>TOTAL POINTS</div>
        <div className={styles.pointsValue}>{points?.toLocaleString() ?? 0}</div>
        {dollarValue && <div className={styles.dollarValue}>{dollarValue}</div>}
      </div>
      {ctaLabel && onCta && (
        <Button color="ghost" text={ctaLabel} onClick={onCta} className={styles.cta} />
      )}
    </div>
  );
}
