import styles from './FleetAlerts.module.scss';

const ALERTS = [
  {
    id: 1,
    color: 'var(--amber-500)',
    title: 'Budget nearing limit',
    description: '$840 remaining — 4 days left in Feb.',
    time: 'Just now',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    id: 2,
    color: 'var(--red-500)',
    title: '3 drivers inactive 5+ days',
    description: 'Ray B., Tom K., Lisa M...',
    time: '2 hrs ago',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    id: 3,
    color: 'var(--color-accent)',
    title: 'Sandra J. hit monthly target',
    description: 'First driver to reach 2,000 pts.',
    time: '4 hrs ago',
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
];

export default function FleetAlerts() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Fleet Alerts</h3>
        <span className={styles.newBadge}>3 new</span>
      </div>

      <div className={styles.list}>
        {ALERTS.map(alert => (
          <div key={alert.id} className={styles.row}>
            <span className={styles.iconCircle} style={{ background: alert.color }}>
              {alert.icon}
            </span>
            <div className={styles.body}>
              <span className={styles.alertTitle}>{alert.title}</span>
              <span className={styles.alertDesc}>{alert.description}</span>
            </div>
            <span className={styles.time}>{alert.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
