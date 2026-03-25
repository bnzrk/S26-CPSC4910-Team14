import styles from './MetricsBar.module.scss';

const METRICS = [
  { value: '50K+', label: 'Active Drivers' },
  { value: '$4.2M', label: 'Rewards Distributed' },
  { value: '1,200+', label: 'Sponsor Companies' },
  { value: '98%', label: 'Driver Satisfaction' },
];

export default function MetricsBar() {
  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {METRICS.map((m) => (
          <div key={m.label} className={styles.metric}>
            <span className={styles.value}>{m.value}</span>
            <span className={styles.label}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
