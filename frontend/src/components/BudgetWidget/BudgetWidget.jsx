import ProgressBar from '../ProgressBar/ProgressBar';
import styles from './BudgetWidget.module.scss';

export default function BudgetWidget({ used = 0, total = 100, resetLabel }) {
  const pct = total > 0 ? used / total : 0;
  return (
    <div className={styles.widget}>
      <div className={styles.header}>
        <span className={styles.label}>Monthly Budget</span>
        {resetLabel && <span className={styles.reset}>{resetLabel}</span>}
      </div>
      <div className={styles.amounts}>
        <span className={styles.used}>${used.toLocaleString()}</span>
        <span className={styles.total}> / ${total.toLocaleString()}</span>
      </div>
      <ProgressBar value={pct} height={6} />
      <div className={styles.foot}>
        <span>{Math.round(pct * 100)}% used</span>
        <span>${(total - used).toLocaleString()} remaining</span>
      </div>
    </div>
  );
}
