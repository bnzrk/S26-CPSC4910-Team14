import styles from './HeroSection.module.scss';

export default function HeroSection({ productName, productDescription, versionNumber }) {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        {versionNumber && (
          <span className={styles.badge}>{versionNumber}</span>
        )}
        <h1 className={styles.title}>{productName}</h1>
        <p className={styles.description}>{productDescription}</p>
      </div>
    </section>
  );
}
