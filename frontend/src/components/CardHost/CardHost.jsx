import styles from './CardHost.module.scss';

export default function CardHost({ title, subtitle, headerRight, children })
{
  return <div className={styles.host}>
    {children}
  </div>;
}