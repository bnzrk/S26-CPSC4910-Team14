import styles from './Avatar.module.scss';
import clsx from 'clsx';

const SIZE_MAP = { sm: 32, md: 38, lg: 44 };

export default function Avatar({ className, onClick, initials = '?', size = 'md', shape = 'circle' }) {
  const px = typeof size === 'number' ? size : (SIZE_MAP[size] ?? 38);
  return (
    <div
      className={clsx(className, styles.avatar, shape === 'rounded' ? styles.rounded : styles.circle)}
      style={{ width: px, height: px, fontSize: Math.round(px * 0.36) }}
      onClick={onClick}
    >
      {String(initials).slice(0, 2).toUpperCase()}
    </div>
  );
}
