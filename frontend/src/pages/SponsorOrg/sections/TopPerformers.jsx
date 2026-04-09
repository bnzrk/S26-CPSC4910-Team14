import { useSponsorOrgDrivers } from "@/api/sponsorOrg";
import Avatar from "@/components/Avatar/Avatar";
import styles from './TopPerformers.module.scss';

export default function TopPerformers({ orgId, limit = 5 }) {
  const { data, isLoading, isError } = useSponsorOrgDrivers(orgId);

  // Extract items safely
  const drivers = data?.items || [];

  // Sort by points descending
  const sortedDrivers = [...drivers].sort((a, b) => (b.points || 0) - (a.points || 0));

  // Limit the number of top performers
  const topDrivers = sortedDrivers.slice(0, limit);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Top Performers</h3>
      </div>

      <div className={styles.list}>
        {isLoading && <div className={styles.pointsText}>Loading top performers...</div>}

        {isError && <div className={styles.noData}>Failed to load top performers.</div>}

        {!isLoading && !isError && topDrivers.length === 0 && (
          <div className={styles.pointsText}>No top performers yet.</div>
        )}

        {!isLoading && !isError && topDrivers.length > 0 && topDrivers.map((driver, index) => {
          const initials = `${driver.firstName?.[0] || ''}${driver.lastName?.[0] || ''}`;
          const rank = index + 1;
          return (
            <div key={driver.id} className={styles.row}>
              <span className={styles.rank}>{rank}</span>
              <Avatar initials={initials} size={34} />
              <span className={styles.name}>{driver.firstName} {driver.lastName}</span>
              <span className={styles.pts}>{driver.points ?? 0} pts</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}