import SearchInput from '../SearchInput/SearchInput';
import Avatar from '../Avatar/Avatar';
import styles from './DashboardHeader.module.scss';

export default function DashboardHeader({ title, subtitle, initials, unreadCount = 0, onSearch, searchValue }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.right}>
        <SearchInput placeholder="Search…" value={searchValue} onChange={onSearch} />
        <button className={styles.bell} aria-label="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && <span className={styles.dot} />}
        </button>
        {initials && <Avatar initials={initials} size="md" />}
      </div>
    </header>
  );
}
