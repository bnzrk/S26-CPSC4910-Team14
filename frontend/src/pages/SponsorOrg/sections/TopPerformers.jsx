import Avatar from '@/components/Avatar/Avatar';
import styles from './TopPerformers.module.scss';

const PERFORMERS = [
  { rank: 1, name: 'Sandra J.', initials: 'SJ', pts: '1,840' },
  { rank: 2, name: 'Marcus R.', initials: 'MR', pts: '1,620' },
  { rank: 3, name: 'Diana C.', initials: 'DC', pts: '1,540' },
  { rank: 4, name: 'Kevin W.', initials: 'KW', pts: '1,310' },
  { rank: 5, name: 'Amy L.', initials: 'AL', pts: '980' },
];

const RANK_COLORS = {
  1: 'var(--amber-500)',
  2: 'var(--gray-400)',
  3: '#cd7c2f',
};

export default function TopPerformers() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Top Performers</h3>
        <span className={styles.period}>Feb 2026</span>
      </div>
      <div className={styles.list}>
        {PERFORMERS.map(p => (
          <div key={p.rank} className={styles.row}>
            <span
              className={styles.rank}
              style={{ color: RANK_COLORS[p.rank] ?? 'var(--color-text-tertiary)' }}
            >
              {p.rank}
            </span>
            <Avatar initials={p.initials} size={34} />
            <span className={styles.name}>{p.name}</span>
            <span className={styles.pts}>{p.pts} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
