import styles from './NavBadge.module.scss';
import clsx from 'clsx';

export default function NavBadge({ count, color = 'green' }) {
  return (
    <span className={clsx(styles.badge, color === 'amber' ? styles.amber : styles.green)}>
      {count}
    </span>
  );
}
