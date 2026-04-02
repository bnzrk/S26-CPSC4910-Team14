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
    case "pill":
      colorClass = styles.pill;
      break;
    case "pillWhite":
      colorClass = styles.pillWhite;
      break;
    case "outline":
      colorClass = styles.outline;
      break;
    case "ghost":
      colorClass = styles.ghost;
      break;
    default:
      colorClass = styles.secondary;
      break;
  }

  var sizeClass = size == 'small' ? styles.small : '';
  var iconOnlyClass = !!Icon && (!text || text == '') ? styles.iconOnly : '';

  return <button {...other} type={type} className={clsx(className, styles.buttonSimple, colorClass, sizeClass, iconOnlyClass)} disabled={disabled} onClick={onClick}>
    {Icon && <Icon className={styles.icon}/>}
    {text && <span>{text}</span>}
    {children}
  </button>
}
