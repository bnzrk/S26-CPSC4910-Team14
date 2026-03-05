import styles from './InlineErrors.module.scss';
import clsx from 'clsx';

export default function InlineErrors({ errors, className, ...other })
{
  return (
    <div {...other} className={clsx(className, styles.inlineErrors)}>
      <ul>
        {errors.map((error) => (
          <li key={error}   className={styles.error}>{error}</li>
        ))}
      </ul>
    </div>
  )
}