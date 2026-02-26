import styles from './CardHost.module.scss';

export default function CardHost({ children }) {
  return <div className={styles.host}>{children}</div>;
}