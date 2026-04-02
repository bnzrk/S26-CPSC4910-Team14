import styles from './Testimonials.module.scss';

const reviews = [
  {
    initials: 'MR',
    name: 'Marcus Rodriguez',
    role: 'OTR Driver · Acme Freight',
    quote: '"DrivePoints completely changed how I think about my deliveries. I\'m actually excited to check my points after every route. Gamechanger."',
  },
  {
    initials: 'LT',
    name: 'Laura Thompson',
    role: 'Fleet Manager · Summit Logistics',
    quote: '"Setting up our rewards program took less than an hour. The custom rule builder is incredibly intuitive. Driver retention has improved 40%."',
  },
  {
    initials: 'DJ',
    name: 'Devon Jackson',
    role: 'Independent Driver',
    quote: '"I drive for three different sponsors and DrivePoints keeps everything in one place. I\'ve earned over $800 in rewards this year alone. Absolutely worth it."',
  },
];

export default function Testimonials() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <p className={styles.sectionLabel}>Reviews</p>
          <h2 className={styles.heading}>Drivers &amp; Sponsors Love It</h2>
          <p className={styles.subhead}>Real feedback from the people on the road and in the office.</p>
        </div>
        <div className={styles.grid}>
          {reviews.map((r) => (
            <div key={r.name} className={styles.card}>
              <div className={styles.stars}>★★★★★</div>
              <p className={styles.quote}>{r.quote}</p>
              <div className={styles.person}>
                <div className={styles.avatar}>{r.initials}</div>
                <div className={styles.personInfo}>
                  <span className={styles.personName}>{r.name}</span>
                  <span className={styles.personRole}>{r.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
