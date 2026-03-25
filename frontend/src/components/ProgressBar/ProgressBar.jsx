import styles from './ProgressBar.module.scss';
import clsx from 'clsx';

export default function ProgressBar({ value = 0, height = 8, variant = 'green' }) {
  const pct = Math.min(1, Math.max(0, value)) * 100;
  return (
    <div
      className={styles.track}
      style={{ height }}
    >
      <div
        className={clsx(styles.fill, variant === 'teal' ? styles.teal : styles.green)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
