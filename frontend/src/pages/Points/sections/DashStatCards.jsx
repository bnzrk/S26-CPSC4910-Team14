import styles from './DashStatCards.module.scss';

function StatCard({ iconBg, icon, trend, value, label }) {
  return (
    <div className={styles.card}>
      <div className={styles.topRow}>
        <div className={styles.iconBox} style={{ background: iconBg }}>{icon}</div>
        <span className={styles.trend}>{trend}</span>
      </div>
      <div className={styles.value}>{value ?? '—'}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export default function DashStatCards({ totalPoints, deliveriesThisMonth, fleetRank, onTimeRate }) {
  return (
    <div className={styles.grid}>
      <StatCard
        iconBg="var(--green-100)"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        }
        trend="+12%"
        value={totalPoints?.toLocaleString() ?? '0'}
        label="Total Points Earned"
      />
      <StatCard
        iconBg="var(--amber-100)"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
            <rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          </svg>
        }
        trend="+8%"
        value={deliveriesThisMonth ?? 47}
        label="Deliveries This Month"
      />
      <StatCard
        iconBg="var(--blue-100)"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
        }
        trend="↑2"
        value={fleetRank ?? '#3'}
        label="Fleet Rank"
      />
      <StatCard
        iconBg="#0f172a"
        icon={
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        }
        trend="+2%"
        value={onTimeRate ?? '96%'}
        label="On-Time Rate"
      />
    </div>
  );
}
