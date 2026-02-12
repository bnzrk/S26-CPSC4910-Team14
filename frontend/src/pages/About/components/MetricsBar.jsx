import { useCountUp } from '../hooks/useCountUp';
import { useScrollReveal } from '../hooks/useScrollReveal';
import styles from './MetricsBar.module.scss';

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function Metric({ label, value, isNumeric = false, isVisible }) {
  const animatedValue = useCountUp(
    isNumeric ? value : 0,
    1500,
    isNumeric && isVisible
  );

  return (
    <div className={styles.metric}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {isNumeric ? animatedValue : value}
      </span>
    </div>
  );
}

export default function MetricsBar({ teamNumber, versionNumber, releaseDate, memberCount }) {
  const [ref, isVisible] = useScrollReveal(0.3);

  return (
    <section ref={ref} className={styles.bar}>
      <Metric label="Team" value={teamNumber} isNumeric isVisible={isVisible} />
      <Metric label="Current Sprint" value={versionNumber} />
      <Metric label="Release Date" value={formatDate(releaseDate)} />
      <Metric label="Team Members" value={memberCount} isNumeric isVisible={isVisible} />
    </section>
  );
}
