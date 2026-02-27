import styles from './Button.module.scss';
import clsx from 'clsx';

export default function Button({ text = '', color, disabled = false, onClick})
{
  var colorClass = "";
  switch (color) {
    case "primary":
      colorClass = styles.primary;
      break;
    case "warn":
      colorClass = styles.warn;
      break;
    default:
      colorClass = styles.secondary;
      break;
  }

  return <button type="submit" className={clsx(styles.buttonSimple, colorClass)} disabled={disabled} onClick={onClick}>
    {text}
  </button>
}