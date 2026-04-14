import { formatUsd } from '@/helpers/formatting';
import styles from './SponsorStatCards.module.scss';

function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num.toString();
}

const CARDS = ({ pointsIssued, rewardsPaid }) => [
  {
    label: 'Active Drivers',
    valueKey: 'driverCount',
    trend: '+4',
    trendUp: true,
    iconBg: 'var(--green-100)',
    iconColor: 'var(--green-700)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Points Issued',
    value: formatNumber(pointsIssued ?? 0),
    trend: '+12%',
    trendUp: true,
    iconBg: 'var(--blue-100)',
    iconColor: 'var(--blue-500)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    label: 'Total Deliveries',
    value: '1,284',
    trend: '+5%',
    trendUp: true,
    iconBg: 'var(--amber-100)',
    iconColor: 'var(--amber-500)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13"/>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    label: 'Avg On-Time Rate',
    value: '94%',
    trend: '+3%',
    trendUp: true,
    iconBg: '#0f172a',
    iconColor: '#fff',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    label: 'Rewards Paid Out',
    value: formatUsd(rewardsPaid),
    trend: '-2%',
    trendUp: false,
    iconBg: 'var(--red-100)',
    iconColor: 'var(--red-500)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12"/>
        <rect x="2" y="7" width="20" height="5"/>
        <line x1="12" y1="22" x2="12" y2="7"/>
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    ),
  },
];

export default function SponsorStatCards({ driverCount, pointsIssued, rewardsPaid }) {
  const cards = CARDS({ pointsIssued, rewardsPaid });
  console.log(rewardsPaid);

  return (
    <div className={styles.grid}>
      {cards.map(card => {
        const displayValue = card.valueKey === 'driverCount' ? driverCount ?? '—' : card.value;
        return (
          <div key={card.label} className={styles.card}>
            <div className={styles.top}>
              <span className={styles.label}>{card.label}</span>
              <span
                className={styles.iconWrap}
                style={{ background: card.iconBg, color: card.iconColor }}
              >
                {card.icon}
              </span>
            </div>
            <div className={styles.value}>{displayValue}</div>
            <div className={styles.trend}>
              <span className={card.trendUp ? styles.up : styles.down}>
                {card.trendUp ? '↑' : '↓'} {card.trend}
              </span>
              <span className={styles.trendLabel}> vs last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
