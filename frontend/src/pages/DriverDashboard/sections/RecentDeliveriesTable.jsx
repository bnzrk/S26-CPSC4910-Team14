import styles from './RecentDeliveriesTable.module.scss';
import clsx from 'clsx';

const MOCK_DELIVERIES = [
  { route: 'Chicago, IL → Kansas City, MO', subtitle: '520 mi · Acme Freight', date: 'Feb 14, 2026', status: 'On Time', points: 650 },
  { route: 'Dallas, TX → Houston, TX', subtitle: '239 mi · Acme Freight', date: 'Feb 12, 2026', status: 'Bonus', points: 420 },
  { route: 'Denver, CO → Salt Lake City, UT', subtitle: '371 mi · Acme Freight', date: 'Feb 10, 2026', status: 'On Time', points: 510 },
  { route: 'Atlanta, GA → Charlotte, NC', subtitle: '244 mi · Acme Freight', date: 'Feb 8, 2026', status: 'In Progress', points: 0 },
  { route: 'Phoenix, AZ → Las Vegas, NV', subtitle: '297 mi · Acme Freight', date: 'Feb 6, 2026', status: 'On Time', points: 390 },
];

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
  const rows = history?.items?.length ? rowsFromHistory(history) : MOCK_DELIVERIES;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Recent Deliveries</span>
          <span className={styles.subtitle}>47 this month</span>
        </div>
        <a href="#" className={styles.viewAll}>View all →</a>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Route</th>
            <th>Date</th>
            <th>Status</th>
            <th className={styles.right}>Points</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
