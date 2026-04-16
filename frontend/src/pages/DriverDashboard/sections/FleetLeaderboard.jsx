import Avatar from '@/components/Avatar/Avatar';
import ProgressBar from '@/components/ProgressBar/ProgressBar';
import styles from './FleetLeaderboard.module.scss';
import clsx from 'clsx';

function rankColor(rank) {
  if (rank === 1) return '#f59e0b';
  if (rank === 2) return '#94a3b8';
  if (rank === 3) return '#cd7c2f';
  return 'var(--gray-400)';
}

function initials(firstName, lastName) {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

export default function FleetLeaderboard({ board, boardLoading, boardError, orgName }) {
  const maxPts = board?.[0]?.points ?? 1;

  const me = board?.find(e => e.isCurrentUser) ?? null;
  let footer = null;
  if (me) {
    if (me.rank === 1) {
      footer = "You're #1 — keep it up!";
    } else {
      const above = board.find(e => e.rank === me.rank - 1);
      const gap = above ? above.points - me.points : null;
      if (gap !== null) {
        footer = `${gap.toLocaleString()} pts separates you from #${me.rank - 1} — keep pushing!`;
      }
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Fleet Leaderboard</span>
          <span className={styles.subtitle}>{orgName ?? 'Your Org'} · {currentMonthYear}</span>
        </div>
        <a href="#" className={styles.viewAll}>Full board →</a>
      </div>

      <div className={styles.list}>
        {boardLoading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.row}>
            <span className={styles.rank} style={{ color: 'var(--color-border)' }}>#{i + 1}</span>
            <div className={clsx(styles.bone, styles.boneAvatar)} />
            <div className={styles.nameWrap}>
              <div className={clsx(styles.bone, styles.boneName)} style={{ marginBottom: 6 }} />
              <div className={clsx(styles.bone, styles.boneName)} style={{ height: 6 }} />
            </div>
            <div className={clsx(styles.bone, styles.bonePts)} />
          </div>
        ))}

        {!boardLoading && boardError && (
          <p className={styles.emptyMsg}>Could not load leaderboard.</p>
        )}

        {!boardLoading && !boardError && board?.length === 0 && (
          <p className={styles.emptyMsg}>No drivers found.</p>
        )}

        {!boardLoading && !boardError && board?.map(entry => (
          <div key={entry.rank} className={clsx(styles.row, entry.isCurrentUser && styles.rowYou)}>
            <span className={styles.rank} style={{ color: rankColor(entry.rank) }}>
              #{entry.rank}
            </span>
            <Avatar initials={initials(entry.firstName, entry.lastName)} size="sm" />
            <div className={styles.nameWrap}>
              <div className={styles.name}>
                {entry.firstName} {entry.lastName}
                {entry.isCurrentUser && <span className={styles.youBadge}>You</span>}
              </div>
              <ProgressBar value={entry.points / maxPts} variant="green" />
            </div>
            <span className={styles.pts}>{entry.points.toLocaleString()}</span>
          </div>
        ))}
      </div>

      {footer && (
        <div className={styles.footer}>{footer}</div>
      )}
    </div>
  );
}
