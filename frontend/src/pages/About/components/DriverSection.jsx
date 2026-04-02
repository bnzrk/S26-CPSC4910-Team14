import styles from './DriverSection.module.scss';

const bulletItems = [
  { title: 'Automatic Point Logging', desc: 'No paperwork. Points are added the moment your delivery is confirmed.' },
  { title: 'Multi-Sponsor Support', desc: 'Work for multiple companies? Manage all your reward programs from one app.' },
  { title: 'Fleet Leaderboards', desc: 'See where you rank among your peers and compete for bonus point milestones.' },
  { title: 'Instant Redemption', desc: 'Redeem your points anytime for fuel cards, prepaid cards, or partner rewards.' },
  { title: 'Performance Insights', desc: 'Track your delivery history, points earned, and safety score over time.' },
];

const activities = [
  { route: 'Chicago → Denver', meta: 'Today · On-time delivery', pts: '+350 pts' },
  { route: 'Dallas → Houston', meta: 'Yesterday · 100-mile bonus', pts: '+150 pts' },
  { route: 'Zero Incident Bonus', meta: 'This month', pts: '+500 pts' },
];

export default function DriverSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Left: Driver dashboard mockup */}
        <div className={styles.mockupWrap}>
          <div className={styles.mockup}>
            {/* User header */}
            <div className={styles.userRow}>
              <div className={styles.avatar}>MR</div>
              <div>
                <div className={styles.userName}>Marcus Rodriguez</div>
                <div className={styles.userMeta}>Acme Freight · Driver since 2022</div>
              </div>
            </div>
            {/* Points banner */}
            <div className={styles.pointsBanner}>
              <div className={styles.ptsValue}>12,450</div>
              <div className={styles.ptsLabel}>Total Points Earned</div>
              <div className={styles.ptsSub}>Rank #3 in your fleet · 2,550 pts to next reward</div>
            </div>
            {/* Activity list */}
            <div className={styles.actList}>
              {activities.map((a) => (
                <div key={a.route} className={styles.actRow}>
                  <div className={styles.actIcon}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <div className={styles.actInfo}>
                    <span className={styles.actRoute}>{a.route}</span>
                    <span className={styles.actMeta}>{a.meta}</span>
                  </div>
                  <span className={styles.actPts}>{a.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Text content */}
        <div className={styles.right}>
          <p className={styles.sectionLabel}>For Drivers</p>
          <h2 className={styles.heading}>You Drive. You Earn. Simple.</h2>
          <p className={styles.subhead}>
            DrivePoints rewards you automatically for every delivery, every milestone, every great performance.
          </p>
          <ul className={styles.bulletList}>
            {bulletItems.map((b) => (
              <li key={b.title} className={styles.bulletItem}>
                <div className={styles.checkIcon}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className={styles.bulletBody}>
                  <span className={styles.bulletTitle}>{b.title}</span>
                  <span className={styles.bulletDesc}>{b.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
