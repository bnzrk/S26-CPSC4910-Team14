import styles from './SkeletonLoader.module.scss';

function Bone({ width, height, style }) {
  return (
    <div
      className={styles.bone}
      style={{ width, height, ...style }}
    />
  );
}

export default function SkeletonLoader() {
  return (
    <div className={styles.skeleton}>
      {/* Hero skeleton */}
      <div className={styles.hero}>
        <Bone width="120px" height="28px" style={{ borderRadius: '999px' }} />
        <Bone width="60%" height="48px" style={{ marginTop: '1rem' }} />
        <Bone width="80%" height="20px" style={{ marginTop: '0.75rem' }} />
        <Bone width="70%" height="20px" style={{ marginTop: '0.5rem' }} />
      </div>

      {/* Metrics skeleton */}
      <div className={styles.metrics}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.metricBlock}>
            <Bone width="60px" height="12px" />
            <Bone width="80px" height="24px" style={{ marginTop: '0.35rem' }} />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className={styles.cards}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className={styles.cardBlock}>
            <Bone width="48px" height="48px" style={{ borderRadius: '10px' }} />
            <Bone width="60%" height="20px" style={{ marginTop: '1rem' }} />
            <Bone width="90%" height="14px" style={{ marginTop: '0.5rem' }} />
            <Bone width="75%" height="14px" style={{ marginTop: '0.35rem' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
