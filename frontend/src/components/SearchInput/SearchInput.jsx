import styles from './SearchInput.module.scss';

export default function SearchInput({ placeholder = 'Search…', value, onChange }) {
  return (
    <div className={styles.wrap}>
      <svg className={styles.icon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        className={styles.input}
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
