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

const MOCK_FEED = [
  { icon: '🚚', iconBg: 'var(--green-100)', event: 'Chicago → Kansas City delivery completed', time: '2h ago', delta: '+650' },
  { icon: '⭐', iconBg: '#fef3c7', event: 'Streak bonus unlocked — 10 days!', time: '5h ago', delta: '+200' },
  { icon: '🎁', iconBg: 'var(--amber-100)', event: 'Fuel Card redeemed from catalog', time: '1d ago', delta: '-500' },
  { icon: '🏆', iconBg: 'var(--blue-100)', event: 'Ranked #3 on Fleet Leaderboard', time: '2d ago', delta: '—' },
  { icon: '🚚', iconBg: 'var(--green-100)', event: 'Dallas → Houston delivery completed', time: '3d ago', delta: '+420' },
];

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
  const feed = history?.items?.length ? feedFromHistory(history) : MOCK_FEED;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>Activity Feed</span>
        <span className={styles.subtitle}>Recent events</span>
      </div>

      <div className={styles.list}>
        {feed.map((item, i) => (
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
        ))}
      </div>
    </div>
  );
}
