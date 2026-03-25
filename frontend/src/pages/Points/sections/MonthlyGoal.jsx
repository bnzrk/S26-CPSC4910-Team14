import styles from './MonthlyGoal.module.scss';

const R = 20;
const CIRC = 2 * Math.PI * R;

export default function MonthlyGoal({ currentPoints = 1760, goalPoints = 2000 }) {
  const pct = Math.min(1, currentPoints / goalPoints);
  const offset = CIRC * (1 - pct);
  const remaining = Math.max(0, goalPoints - currentPoints);
  const deliveriesLeft = Math.ceil(remaining / 120);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <span className={styles.title}>Monthly Goal</span>
          <span className={styles.subtitle}>{goalPoints.toLocaleString()} pts target</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.ring}>
          <svg width="72" height="72" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={R} fill="none" stroke="var(--green-100)" strokeWidth="6" />
            <circle
              cx="28" cy="28" r={R}
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              transform="rotate(-90 28 28)"
            />
          </svg>
          <div className={styles.ringLabel}>
            <span className={styles.ringPct}>{Math.round(pct * 100)}%</span>
            <span className={styles.ringDone}>Done</span>
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.progress}>
            {currentPoints.toLocaleString()} / {goalPoints.toLocaleString()} pts
          </div>
          <div className={styles.infoText}>
            {remaining.toLocaleString()} pts away from hitting your monthly target.
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        ~{deliveriesLeft} {deliveriesLeft === 1 ? 'delivery' : 'deliveries'} to go
      </div>
    </div>
  );
}
