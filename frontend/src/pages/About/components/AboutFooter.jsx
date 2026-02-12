import styles from './AboutFooter.module.scss';

export default function AboutFooter() {
  return (
    <footer className={styles.footer}>
      <p className={styles.text}>
        CPSC 4910/4911 &middot; Clemson University &middot; Spring 2026
      </p>
    </footer>
  );
}
