import styles from './ActivityFeed.module.scss';
import clsx from 'clsx';

function formatRelative(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function feedFromHistory(history) {
  return (history?.items ?? []).slice(0, 5).map(t => {
    const change = Number(t.balanceChange ?? 0);
    const isPos = change > 0;
    const isNeg = change < 0;
    return {
      icon: isPos ? '🚚' : '🎁',
      iconBg: isPos ? 'var(--green-100)' : '#fef3c7',
      event: t.reason ?? 'Point transaction',
      time: formatRelative(t.transactionDateUtc),
      delta: isPos ? `+${change}` : isNeg ? `${change}` : '—',
    };
  });
}

export default function ActivityFeed({ history }) {
  const isLoading = history === null;
  const feed = !isLoading ? feedFromHistory(history) : [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Activity Feed</span>
        <span className={styles.subtitle}>Recent events</span>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.row}>
              <div className={clsx(styles.bone, styles.boneCircle)} />
              <div className={styles.boneText}>
                <div className={clsx(styles.bone, styles.boneLine)} />
                <div className={clsx(styles.bone, styles.boneLineShort)} />
              </div>
            </div>
          ))
        ) : feed.length === 0 ? (
          <div className={styles.emptyMsg}>No recent activity.</div>
        ) : (
          feed.map((item, i) => (
            <div key={i} className={styles.row}>
              <div className={styles.iconCircle} style={{ background: item.iconBg }}>
                {item.icon}
              </div>
              <div className={styles.text}>
                <div className={styles.event}>{item.event}</div>
                <div className={styles.time}>{item.time}</div>
              </div>
              <span className={clsx(
                styles.delta,
                item.delta.startsWith('+') ? styles.deltaPos : item.delta.startsWith('-') ? styles.deltaNeg : styles.deltaNeutral
              )}>
                {item.delta}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
