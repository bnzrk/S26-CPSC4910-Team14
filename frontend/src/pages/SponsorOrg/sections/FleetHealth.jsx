import ProgressBar from '@/components/ProgressBar/ProgressBar';
import styles from './FleetHealth.module.scss';

const METRICS = [
  { label: 'Driver Engagement', value: 94 },
  { label: 'On-Time Deliveries', value: 91 },
  { label: 'Monthly Goal Completion', value: 68 },
  { label: 'Zero-Incident Rate', value: 87 },
];

export default function FleetHealth() {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Fleet Health</h3>
      <div className={styles.list}>
        {METRICS.map(m => (
          <div key={m.label} className={styles.metric}>
            <div className={styles.metricRow}>
              <span className={styles.label}>{m.label}</span>
              <span className={styles.pct}>{m.value}%</span>
            </div>
            <ProgressBar value={m.value / 100} height={4} variant="green" />
          </div>
        ))}
      </div>
    </div>
  );
}
