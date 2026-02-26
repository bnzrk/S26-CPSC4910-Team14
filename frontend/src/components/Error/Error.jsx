import styles from './Error.module.scss';

export default function PointCard({ message }) {
  return <p className={styles.error}>{message}</p>;
}