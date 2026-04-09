import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import styles from './SettingsPage.module.scss';

export default function DriverSettingsPage() {
  return (
    <CardHost className={styles.page}>
      <Card title="Appearance" className={styles.card}>
        <div className={styles.row}>
          <div className={styles.info}>
            <p className={styles.label}>Theme</p>
            <p className={styles.description}>Choose how DrivePoints looks to you. System follows your OS preference.</p>
          </div>
          <ThemeToggle />
        </div>
      </Card>
    </CardHost>
  );
}
