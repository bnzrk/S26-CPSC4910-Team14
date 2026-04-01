import styles from './RewardBudget.module.scss';

const SEGMENTS = [
  { label: 'Paid Out', amount: '$3,840', pct: 77, color: 'var(--color-accent)' },
  { label: 'Pending', amount: '$320', pct: 6, color: 'var(--amber-500)' },
  { label: 'Available', amount: '$840', pct: 17, color: 'var(--gray-300)' },
];

export default function RewardBudget() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Reward Budget</h3>
          <p className={styles.subtitle}>Feb 2026 · $5,000 cap</p>
        </div>
        <button className={styles.adjustBtn}>Adjust</button>
      </div>

      <div className={styles.bar}>
        {SEGMENTS.map(s => (
          <div
            key={s.label}
            className={styles.barSegment}
            style={{ width: `${s.pct}%`, background: s.color }}
            title={`${s.label}: ${s.amount} (${s.pct}%)`}
          />
        ))}
      </div>

      <div className={styles.legend}>
        {SEGMENTS.map(s => (
          <div key={s.label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: s.color }} />
            <div className={styles.legendText}>
              <span className={styles.legendLabel}>{s.label}</span>
              <span className={styles.legendAmount}>{s.amount}</span>
              <span className={styles.legendPct}>{s.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <span className={styles.usedPill}>77% Used</span>
      </div>
    </div>
  );
}
