import styles from './AboutFooter.module.scss';

export default function AboutFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo}>DrivePoints</span>
          <p className={styles.tagline}>
            The rewards platform built for the trucking industry. Connecting sponsors and drivers through points that power performance.
          </p>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Platform</h4>
          <span>For Sponsors</span>
          <span>For Drivers</span>
          <span>Features</span>
          <span>Pricing</span>
          <span>Integrations</span>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Company</h4>
          <span>About Us</span>
          <span>Blog</span>
          <span>Careers</span>
          <span>Press</span>
        </div>
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Legal</h4>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Cookie Policy</span>
        </div>
      </div>
      <div className={styles.bottom}>
        <p>© 2026 DrivePoints · Team 14 · Clemson University · CPSC 4910/4911</p>
      </div>
    </footer>
  );
}
