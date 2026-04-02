import styles from './CtaSection.module.scss';

export default function CtaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.heading}>Ready to Hit the Road with Rewards?</h2>
        <p className={styles.sub}>
          Join thousands of drivers and sponsors already using DrivePoints to turn every delivery into an opportunity.
        </p>
        <div className={styles.btnGroup}>
          <a href="/register" className={styles.btnWhite}>Get Started as Sponsor</a>
          <a href="/register" className={styles.btnOutline}>Sign Up as Driver</a>
        </div>
      </div>
    </section>
  );
}
