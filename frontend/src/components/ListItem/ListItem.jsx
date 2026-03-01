import styles from './ListItem.module.scss';

export default function ListItem({
    children,
    showChevron = false,
    label = '',
    icon,
    item,
    onClick,
}) {
    return (<div className={styles.listItem} onClick={onClick}>
        <div className={styles.left}>
            <span className={styles.label}>{label && label}</span>
        </div>
        <div className={styles.right}>
            {showChevron && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="chevron lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>}
        </div>
    </div>);
}