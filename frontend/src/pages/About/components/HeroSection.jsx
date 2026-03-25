import styles from './HeroSection.module.scss';

export default function HeroSection({ productDescription, versionNumber }) {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.content}>
          {versionNumber && (
            <span className={styles.badge}>{versionNumber}</span>
          )}
          <h1 className={styles.title}>
            Every Mile Earns{' '}
            <span className={styles.highlight}>Points</span>
          </h1>
          <p className={styles.description}>{productDescription}</p>
          <div className={styles.btnGroup}>
            <a href="/register" className={styles.btnPrimary}>Get Started as Sponsor</a>
            <a href="/register" className={styles.btnOutline}>Sign Up as Driver</a>
          </div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroCardBadge}>Live Dashboard</div>
          <div className={styles.heroCardInner}>
            <div className={styles.pointsBanner}>
              <div className={styles.pointsValue}>12,450</div>
              <div className={styles.pointsLabel}>Total Points Earned</div>
              <div className={styles.pointsSub}>Rank #3 in your fleet · 2,550 pts to next reward</div>
            </div>
            <div className={styles.activityList}>
              {[
                { route: 'Chicago → Denver', meta: 'Today · On-time delivery', pts: '+350 pts' },
                { route: 'Dallas → Houston', meta: 'Yesterday · 100-mile bonus', pts: '+150 pts' },
                { route: 'Zero Incident Bonus', meta: 'This month', pts: '+500 pts' },
              ].map((row) => (
                <div key={row.route} className={styles.activityRow}>
                  <div className={styles.activityIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div className={styles.activityInfo}>
                    <span className={styles.activityRoute}>{row.route}</span>
                    <span className={styles.activityMeta}>{row.meta}</span>
                  </div>
                  <span className={styles.activityPts}>{row.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
