import Avatar from '../Avatar/Avatar';
import styles from './ActivityRow.module.scss';

export default function ActivityRow({ initials, name, route, points }) {
  const isPositive = points >= 0;
  return (
    <div className={styles.row}>
      <Avatar initials={initials} size="md" />
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        {route && <span className={styles.route}>{route}</span>}
      </div>
      <span className={isPositive ? styles.positive : styles.negative}>
        {isPositive ? '+' : ''}{points?.toLocaleString()} pts
      </span>
    </div>
  );
}
