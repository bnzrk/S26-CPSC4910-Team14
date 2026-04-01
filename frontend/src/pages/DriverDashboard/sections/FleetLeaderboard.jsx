import Avatar from '@/components/Avatar/Avatar';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import styles from './FleetLeaderboard.module.scss';
import clsx from 'clsx';

const MOCK_BOARD = [
  { rank: 1, name: 'Marcus Williams', points: 2840, isYou: false },
  { rank: 2, name: 'Sarah Chen', points: 2650, isYou: false },
  { rank: 3, name: 'Alex Rodriguez', points: 2520, isYou: true },
  { rank: 4, name: 'Jordan Lee', points: 2310, isYou: false },
  { rank: 5, name: 'Taylor Brooks', points: 2190, isYou: false },
  { rank: 6, name: 'Chris Morgan', points: 1980, isYou: false },
];

function rankColor(rank) {
  if (rank === 1) return '#f59e0b';
  if (rank === 2) return '#94a3b8';
  if (rank === 3) return '#cd7c2f';
  return 'var(--gray-400)';
}

function initials(name) {
  const parts = name.split(' ');
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2);
}

export default function FleetLeaderboard({ board = MOCK_BOARD }) {
  const maxPts = board[0]?.points ?? 1;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Fleet Leaderboard</span>
          <span className={styles.subtitle}>Acme Freight · Feb 2026</span>
        </div>
        <a href="#" className={styles.viewAll}>Full board →</a>
      </div>

      <div className={styles.list}>
        {board.map(entry => (
          <div key={entry.rank} className={clsx(styles.row, entry.isYou && styles.rowYou)}>
            <span className={styles.rank} style={{ color: rankColor(entry.rank) }}>
              #{entry.rank}
            </span>
            <Avatar initials={initials(entry.name)} size="sm" />
            <div className={styles.nameWrap}>
              <div className={styles.name}>
                {entry.name}
                {entry.isYou && <span className={styles.youBadge}>You</span>}
              </div>
              <ProgressBar value={entry.points / maxPts} variant="green" />
            </div>
            <span className={styles.pts}>{entry.points.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        130 pts separates you from #2 — keep pushing!
      </div>
    </div>
  );
}
