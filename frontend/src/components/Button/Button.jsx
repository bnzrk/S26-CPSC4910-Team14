import styles from './Button.module.scss';
import clsx from 'clsx';

export default function Button({ children, text = '', color, icon: Icon, size, disabled = false, onClick, className, type = 'button', ...other})
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

  var sizeClass = size == 'small' ? styles.small : '';

  return <button {...other} type={type} className={clsx(className, styles.buttonSimple, colorClass, sizeClass)} disabled={disabled} onClick={onClick}>
    {Icon && <Icon className={styles.icon}/>}
    {text && <span>{text}</span>}
    {children}
  </button>
}