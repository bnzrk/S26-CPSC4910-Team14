import styles from './DeliveryStreak.module.scss';
import clsx from 'clsx';

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DeliveryStreak({ streakDays = 12, activeDays = [0, 1, 2, 3, 4] }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Delivery Streak</span>
        <div className={styles.streakCount}>
          <span className={styles.streakNumber}>{streakDays}</span>
          <span className={styles.streakUnit}>days</span>
        </div>
      </div>

      <div className={styles.days}>
        {DAYS.map((d, i) => (
          <div key={i} className={clsx(styles.day, activeDays.includes(i) && styles.dayActive)}>
            {d}
          </div>
        ))}
      </div>

      <div className={styles.tip}>
        Keep it going! 3 more days unlocks a +200 pt streak bonus.
      </div>
    </div>
  );
}
