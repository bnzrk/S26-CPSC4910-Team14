import styles from './Card.module.scss';
import clsx from 'clsx';

export default function Card({
  title,
  headerRight,
  footer,
  children,
  className,
  noPadding = false,
  variant
}) {
  return (
    <section className={clsx(styles.card, className, styles[variant])}>
      {(title || headerRight) && (
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          {headerRight && (
            <div className={styles.headerRight}>
              {headerRight}
            </div>
          )}
        </div>
      )}

      <div className={clsx(!noPadding && styles.body)}>
        {children}
      </div>

      {footer && (
        <div className={styles.footer}>
          {footer}
        </div>
      )}
    </section>
  );
}