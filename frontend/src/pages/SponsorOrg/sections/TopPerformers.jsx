import { useSponsorOrgDrivers } from "@/api/sponsorOrg";
import { useSponsorTopDrivers } from "@/api/sponsorOrg";
import Avatar from "@/components/Avatar/Avatar";
import styles from './TopPerformers.module.scss';

export default function TopPerformers({ orgId, limit = 5 })
{
  const { data: drivers, isLoading, isError } = useSponsorTopDrivers(orgId, limit);

  // Limit the number of top performers
  const topDrivers = drivers ? drivers.slice(0, limit) : [];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Top Performers</h3>
          <p className={styles.subtitle}>
            {new Date().toLocaleString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      <div className={styles.list}>
        {isLoading && <div className={styles.pointsText}>Loading top performers...</div>}

        {isError && <div className={styles.noData}>Failed to load top performers.</div>}

        {!isLoading && !isError && topDrivers.length === 0 && (
          <div className={styles.pointsText}>No top performers yet.</div>
        )}

        {!isLoading && !isError && topDrivers.length > 0 && topDrivers.map((driver, index) =>
        {
          const initials = `${driver.firstName?.[0] || ''}${driver.lastName?.[0] || ''}`;
          const rank = index + 1;
          return (
            <div key={driver.id} className={styles.row}>
              <span className={styles.rank}>{rank}</span>
              <Avatar initials={initials} size={34} />
              <span className={styles.name}>{driver.firstName} {driver.lastName}</span>
              <span className={styles.pts}>+{driver.monthlyNetPoints ?? 0} pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}