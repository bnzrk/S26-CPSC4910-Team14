import styles from './CardHost.module.scss';

export default function CardHost({ title, subtitle, children })
{
  return <div className={styles.host}>
    {(title || subtitle) && <div>
      {title && <h1 className={styles.hostTitle}>{title}</h1>}
      {subtitle && <p className={styles.hostSubtitle}>
        {subtitle}
      </p>}
    </div>}

    {children}
  </div>;
}