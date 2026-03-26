import styles from './CardHost.module.scss';

export default function CardHost({ title, subtitle, headerRight, children })
{
  return <div className={styles.host}>
    {(title || subtitle || headerRight) && <div className={styles.hostHeader}>
      <div>
        {title && <h1 className={styles.hostTitle}>{title}</h1>}
        {subtitle && <p className={styles.hostSubtitle}>{subtitle}</p>}
      </div>
      {headerRight && <div>{headerRight}</div>}
    </div>}

    {children}
  </div>;
}