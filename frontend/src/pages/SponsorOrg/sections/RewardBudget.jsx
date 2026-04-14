import styles from './RewardBudget.module.scss';

const getSegments = (paidOut, pending, cap) =>
{
  const paidOutPct = Math.round((paidOut / cap) * 100);
  const pendingPct = Math.round((pending / cap) * 100);
  const availablePct = 100 - paidOutPct - pendingPct;
  const available = cap - paidOut - pending;

  return [
    { label: 'Paid Out', amount: `$${paidOut}`, pct: paidOutPct, color: 'var(--color-accent)' },
    { label: 'Pending', amount: `$${pending}`, pct: pendingPct, color: 'var(--amber-500)' },
    { label: 'Available', amount: `$${available}`, pct: availablePct, color: 'var(--gray-300)' },
  ];
};

export default function RewardBudget({ paidOut = 0, pending = 0, cap = 5000 })
{
  const available = cap - paidOut >= 0 ? cap - paidOut : 0;
  const segments = getSegments(paidOut, pending, available);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Reward Budget</h3>
          <p className={styles.subtitle}>Feb 2026 · ${cap} cap</p>
        </div>
        <button className={styles.adjustBtn}>Adjust</button>
      </div>

      <div className={styles.bar}>
        {segments.map(s => (
          <div
            key={s.label}
            className={styles.barSegment}
            style={{ width: `${s.pct}%`, background: s.color }}
            title={`${s.label}: ${s.amount} (${s.pct}%)`}
          />
        ))}
      </div>

      <div className={styles.legend}>
        {segments.map(s => (
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
        <span className={styles.usedPill}>{Math.round(((paidOut + pending) / cap) * 100)}% Used</span>
      </div>
    </div>
  );
}
