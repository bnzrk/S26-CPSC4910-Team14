import styles from './RolesSection.module.scss';

const sponsorSteps = [
  { title: 'Create a Sponsor Account', desc: 'Register your company and invite your fleet of drivers to join your program.' },
  { title: 'Define Point Rules', desc: 'Set custom rules: on-time delivery, mileage bonuses, safety scores, and more.' },
  { title: 'Monitor & Manage', desc: 'View real-time dashboards, approve point awards, and manage your reward budget.' },
  { title: 'Redeem & Retain', desc: 'Drivers redeem points for rewards you choose — fuel cards, bonuses, merchandise.' },
];

const driverSteps = [
  { title: 'Join a Program', desc: "Sign up and get linked to your sponsor's DrivePoints program instantly." },
  { title: 'Complete Deliveries', desc: 'Points are automatically logged for each completed delivery and milestone.' },
  { title: 'Track Your Progress', desc: 'See your points balance, ranking, and upcoming bonuses in your driver dashboard.' },
  { title: 'Redeem Your Rewards', desc: 'Cash in points for fuel cards, gift cards, merchandise, and more.' },
];

export default function RolesSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.sectionLabel}>The Process</p>
          <h2 className={styles.heading}>Built for Both Sides of the Road</h2>
          <p className={styles.subhead}>
            Whether you&rsquo;re fueling a fleet or driving one, DrivePoints makes earning and rewarding simple.
          </p>
        </div>
        <div className={styles.grid}>
          {/* Sponsors card */}
          <div className={styles.card}>
            <div className={styles.roleBadgeGreen}>For Sponsors</div>
            <h3 className={styles.cardTitle}>Host &amp; Reward Your Drivers</h3>
            <p className={styles.cardDesc}>
              Set up a custom rewards program tailored to your fleet. Define rules, track performance, and motivate your drivers with points that matter.
            </p>
            <ol className={styles.stepList}>
              {sponsorSteps.map((s, i) => (
                <li key={i} className={styles.stepItem}>
                  <div className={styles.stepNum}>{i + 1}</div>
                  <div className={styles.stepBody}>
                    <span className={styles.stepTitle}>{s.title}</span>
                    <span className={styles.stepDesc}>{s.desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Drivers card */}
          <div className={styles.card}>
            <div className={styles.roleBadgeDark}>For Drivers</div>
            <h3 className={styles.cardTitle}>Earn Points on Every Delivery</h3>
            <p className={styles.cardDesc}>
              Get rewarded for the work you&rsquo;re already doing. Join a sponsor&rsquo;s program, complete deliveries, and watch your points grow with every mile.
            </p>
            <ol className={styles.stepList}>
              {driverSteps.map((s, i) => (
                <li key={i} className={styles.stepItem}>
                  <div className={styles.stepNum}>{i + 1}</div>
                  <div className={styles.stepBody}>
                    <span className={styles.stepTitle}>{s.title}</span>
                    <span className={styles.stepDesc}>{s.desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
