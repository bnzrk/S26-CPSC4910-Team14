import styles from './RedeemRewards.module.scss';
import clsx from 'clsx';

const MOCK_REWARDS = [
  { icon: '⛽', name: 'Fuel Card', cost: 500, locked: false },
  { icon: '🎧', name: 'Headphones', cost: 1200, locked: false },
  { icon: '🎮', name: 'Game Console', cost: 8000, locked: false },
  { icon: '✈️', name: 'Travel Credit', cost: 15000, locked: true, need: 2550 },
  { icon: '🎁', name: 'Amazon Gift', cost: 3000, locked: false },
  { icon: '🏆', name: 'Driver Award', cost: 20000, locked: true, need: 7550 },
];

export default function RedeemRewards({ balance = 12450, rewards = MOCK_REWARDS }) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Redeem Rewards</span>
          <span className={styles.subtitle}>{balance.toLocaleString()} pts available</span>
        </div>
        <a href="#" className={styles.viewAll}>Catalog →</a>
      </div>

      <div className={styles.grid}>
        {rewards.map((r, i) => (
          <div key={i} className={clsx(styles.item, r.locked && styles.itemLocked)}>
            <div className={styles.itemIcon}>{r.icon}</div>
            <div className={styles.itemName}>{r.name}</div>
            <div className={styles.itemCost}>{r.cost.toLocaleString()} pts</div>
            {r.locked && (
              <div className={styles.lockOverlay}>
                <span className={styles.lockIcon}>🔒</span>
                <span className={styles.lockText}>Need {r.need.toLocaleString()} more</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <button className={styles.redeemBtn}>Redeem Points Now</button>
    </div>
  );
}
