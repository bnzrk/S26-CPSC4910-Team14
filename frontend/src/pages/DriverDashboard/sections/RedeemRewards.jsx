import { Link } from 'react-router-dom';
import { formatUsd } from '@/helpers/formatting';
import styles from './RedeemRewards.module.scss';
import clsx from 'clsx';

function ShoppingBagIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  );
}

export default function RedeemRewards({ balance = 0, catalog, catalogLoading, catalogError, onRetry }) {
  const items = (catalog?.items ?? []).slice(0, 6).map(item => ({
    imgUrl: item.images?.[0] ?? null,
    name: item.title,
    cost: item.pricePoints,
    locked: item.pricePoints > balance,
    need: Math.max(0, item.pricePoints - balance),
    available: item.isAvailable,
  }));

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.title}>Redeem Rewards</span>
          <span className={styles.subtitle}>{balance} pts available</span>
        </div>
        <Link to="/driver/catalog" className={styles.viewAll}>Catalog →</Link>
      </div>

      {catalogLoading ? (
        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.item}>
              <div className={clsx(styles.bone, styles.boneIcon)} />
              <div className={clsx(styles.bone, styles.boneLine)} />
              <div className={clsx(styles.bone, styles.boneLine, styles.boneShort)} />
            </div>
          ))}
        </div>
      ) : catalogError ? (
        <div className={styles.errorMsg}>
          <span>Could not load catalog.</span>
          <button className={styles.retryBtn} onClick={onRetry}>Retry</button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyMsg}>No catalog items available.</div>
      ) : (
        <div className={styles.grid}>
          {items.map((r, i) => (
            <div key={i} className={clsx(styles.item, r.locked && styles.itemLocked)}>
              {r.imgUrl
                ? <img src={r.imgUrl} alt={r.name} className={styles.itemImg} />
                : <div className={styles.itemNoImg}><ShoppingBagIcon /></div>
              }
              <div className={styles.itemName}>{r.name}</div>
              <div className={styles.itemCost}>{r?.cost} pts</div>
              {r.locked && (
                <div className={styles.lockOverlay}>
                  <span className={styles.lockIcon}>🔒</span>
                  <span className={styles.lockText}>Need {r?.need} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Link to="/shop" className={styles.redeemBtn}>Redeem Points Now</Link>
    </div>
  );
}
