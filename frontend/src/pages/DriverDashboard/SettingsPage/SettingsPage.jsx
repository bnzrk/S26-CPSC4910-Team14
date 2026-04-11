import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast/ToastContext';
import { useAlertSettings, useUpdateAlertSettings } from '@/api/alert';
import CardHost from '@/components/CardHost/CardHost';
import Card from '@/components/Card/Card';
import AsyncButton from '@/components/AsyncButton/AsyncButton';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import styles from './SettingsPage.module.scss';

const DEFAULT_ALERT_SETTINGS = {
  isOrderAlertsEnabled: true,
  isPointChangeAlertsEnabled: true,
};

export default function DriverSettingsPage()
{
  const { push } = useToast();
  const { data: alertSettings, isLoading: isAlertSettingsLoading } = useAlertSettings();
  const updateAlertSettings = useUpdateAlertSettings();

  const [localSettings, setLocalSettings] = useState(DEFAULT_ALERT_SETTINGS);

  useEffect(() =>
  {
    if (alertSettings)
    {
      setLocalSettings({
        isOrderAlertsEnabled: alertSettings.isOrderAlertsEnabled,
        isPointChangeAlertsEnabled: alertSettings.isPointChangeAlertsEnabled,
      });
    }
  }, [alertSettings]);

  const hasChanges = alertSettings && (
    localSettings.isOrderAlertsEnabled !== alertSettings.isOrderAlertsEnabled ||
    localSettings.isPointChangeAlertsEnabled !== alertSettings.isPointChangeAlertsEnabled
  );

  console.log(localSettings);
  console.log(alertSettings);

  function handleCheckboxChange(e)
  {
    const { name, checked } = e.target;
    setLocalSettings(prev => ({ ...prev, [name]: checked }));
  }

  async function handleUpdateAlertSettings()
  {
    try
    {
      await updateAlertSettings.mutateAsync(localSettings);
      push({ type: 'success', message: 'Changes saved!' });
    } catch (ex)
    {
      console.log(ex);
      push({ type: 'error', message: 'Could not save changes.' });
    }
  }

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
      <Card title="Alert Settings">
        {isAlertSettingsLoading ? (
          <p>Loading...</p>
        ) : (
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                name="isOrderAlertsEnabled"
                checked={localSettings.isOrderAlertsEnabled}
                onChange={handleCheckboxChange}
              />
              <div className={styles.info}>
                <p className={styles.label}>Order Alerts</p>
                <p className={styles.description}>Receive alerts when an order is placed.</p>
              </div>
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                name="isPointChangeAlertsEnabled"
                checked={localSettings.isPointChangeAlertsEnabled}
                onChange={handleCheckboxChange}
              />
              <div className={styles.info}>
                <p className={styles.label}>Point Change Alerts</p>
                <p className={styles.description}>Receive alerts when you are awarded or deducted points.</p>
              </div>
            </label>
          </div>
        )}
        <div className={styles.buttonRow}>
          <AsyncButton
            className={styles.saveButton}
            text="Save Changes"
            color="primary"
            disabled={!hasChanges || updateAlertSettings.isPending}
            action={handleUpdateAlertSettings}
          />
        </div>
      </Card>
    </CardHost>
  );
}