import styles from './Loader.module.scss';
import clsx from 'clsx';

export default function Loader({ className, ...other })
{
    return (
        <div className={clsx(styles.wrapper, className)}><span {...other} className={styles.loader}></span></div>
    );
}