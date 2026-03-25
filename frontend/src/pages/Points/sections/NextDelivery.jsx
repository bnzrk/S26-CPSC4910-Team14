import styles from './NextDelivery.module.scss';

export default function NextDelivery({
  route = 'Chicago, IL → Kansas City, MO',
  time = 'Today, 2:00 PM',
  distance = '520 mi',
  points = 650,
}) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>NEXT DELIVERY</span>
      <h3 className={styles.route}>{route}</h3>
      <div className={styles.details}>
        <span className={styles.detail}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {time}
        </span>
        <span className={styles.detail}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          {distance}
        </span>
      </div>
      <div className={styles.pointsRow}>
        <div className={styles.pointsLeft}>
          <span className={styles.pointsValue}>+{points} pts</span>
          <span className={styles.pointsLabel}>estimated</span>
        </div>
        <button className={styles.startBtn}>Start Route →</button>
      </div>
    </div>
  );
}
