import styles from './RecentDeliveriesTable.module.scss';
import clsx from 'clsx';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }) {
  const cls = {
    'On Time': styles.statusGreen,
    'Bonus': styles.statusAmber,
    'In Progress': styles.statusBlue,
    'Adjustment': styles.statusGray,
  }[status] ?? styles.statusGray;
  return <span className={clsx(styles.badge, cls)}>{status}</span>;
}

function RouteIcon({ status }) {
  if (status === 'Bonus') {
    return (
      <div className={clsx(styles.routeIcon, styles.iconAmber)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </div>
    );
  }
  if (status === 'In Progress') {
    return (
      <div className={clsx(styles.routeIcon, styles.iconGray)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
    );
  }
  return (
    <div className={clsx(styles.routeIcon, styles.iconGreen)}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      </svg>
    </div>
  );
}

function rowsFromHistory(history) {
  const items = history?.items ?? [];
  return items.slice(0, 5).map(t => {
    const change = Number(t.balanceChange ?? 0);
    const status = change > 0 ? 'On Time' : change < 0 ? 'Adjustment' : 'In Progress';
    return {
      route: t.reason ?? 'Delivery',
      subtitle: '',
      date: formatDate(t.transactionDateUtc),
      status,
      points: change,
    };
  });
}

export default function RecentDeliveriesTable({ history }) {
  const isLoading = history === null;
  const rows = !isLoading ? rowsFromHistory(history) : [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Recent Transactions</span>
        </div>
        <a href="#" className={styles.viewAll}>View all →</a>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Description</th>
            <th>Date</th>
            <th>Status</th>
            <th className={styles.right}>Points</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i}>
                <td><div className={clsx(styles.bone, styles.boneWide)} /></td>
                <td><div className={clsx(styles.bone, styles.boneMed)} /></td>
                <td><div className={clsx(styles.bone, styles.boneNarrow)} /></td>
                <td className={styles.right}><div className={clsx(styles.bone, styles.boneShort)} /></td>
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={4} className={styles.emptyCell}>No recent activity.</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i}>
                <td>
                  <div className={styles.routeCell}>
                    <RouteIcon status={row.status} />
                    <div>
                      <div className={styles.routeName}>{row.route}</div>
                      {row.subtitle && <div className={styles.routeSub}>{row.subtitle}</div>}
                    </div>
                  </div>
                </td>
                <td className={styles.dateCell}>{row.date}</td>
                <td><StatusBadge status={row.status} /></td>
                <td className={clsx(styles.right, row.points > 0 ? styles.pointsPos : row.points < 0 ? styles.pointsNeg : styles.pointsNeutral)}>
                  {row.points > 0 ? `+${row.points}` : row.points === 0 ? '—' : row.points}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
