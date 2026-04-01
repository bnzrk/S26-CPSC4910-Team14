import styles from './SponsorSection.module.scss';

const features = [
  {
    title: 'Set Custom Point Rules',
    desc: 'Define exactly how drivers earn — per mile, per delivery, for on-time performance, or any custom metric.',
  },
  {
    title: 'Live Program Analytics',
    desc: 'Monitor driver engagement, points distribution, and reward redemptions with real-time dashboards.',
  },
  {
    title: 'Automated Point Awarding',
    desc: 'No manual entry. Points are awarded automatically based on your rules and verified delivery data.',
  },
];

const rules = [
  { label: 'On-time delivery (within 30 min)', pts: '+100 pts' },
  { label: 'Every 100 miles driven', pts: '+50 pts' },
  { label: 'Zero incident month', pts: '+500 pts' },
  { label: 'Referral — new driver joins', pts: '+300 pts' },
  { label: 'Hazmat certified delivery', pts: '+200 pts' },
];

const stats = [
  { value: '32', label: 'Active Drivers' },
  { value: '48k', label: 'Pts Issued' },
  { value: '94%', label: 'Engagement' },
];

export default function SponsorSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Left: text + feature list */}
        <div className={styles.left}>
          <p className={styles.sectionLabel}>For Sponsors</p>
          <h2 className={styles.heading}>Your Fleet. Your Rules.{'\n'}Your Rewards.</h2>
          <p className={styles.subhead}>
            Take full control of your rewards program with powerful tools designed for fleet managers and logistics companies.
          </p>
          <div className={styles.featureList}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.featureTitle}>{f.title}</div>
                  <div className={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Point Rules mockup */}
        <div className={styles.mockup}>
          <div className={styles.mockupHeader}>
            <span className={styles.mockupTitle}>Point Rules — Acme Freight</span>
            <button className={styles.addBtn}>+ Add Rule</button>
          </div>
          <div className={styles.ruleList}>
            {rules.map((r) => (
              <div key={r.label} className={styles.ruleRow}>
                <span className={styles.ruleDot} />
                <span className={styles.ruleLabel}>{r.label}</span>
                <span className={styles.rulePts}>{r.pts}</span>
              </div>
            ))}
          </div>
          <div className={styles.statsRow}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statBox}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
