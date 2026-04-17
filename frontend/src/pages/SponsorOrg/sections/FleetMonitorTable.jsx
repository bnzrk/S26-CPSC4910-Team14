import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/Avatar/Avatar';
import { useSponsorOrgDrivers } from '@/api/sponsorOrg';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import { useSponsorTopDrivers } from '@/api/sponsorOrg';
import styles from './FleetMonitorTable.module.scss';
import clsx from 'clsx';

const MOCK_STATS = [
  { pts: '1,840', deliveries: 52, onTime: '96%', rank: 1, delta: 0, status: 'Active' },
  { pts: '1,620', deliveries: 48, onTime: '94%', rank: 2, delta: 1, status: 'Active' },
  { pts: '1,540', deliveries: 45, onTime: '91%', rank: 3, delta: -1, status: 'Active' },
  { pts: '1,310', deliveries: 40, onTime: '89%', rank: 4, delta: 0, status: 'Active' },
  { pts: '980', deliveries: 31, onTime: '85%', rank: 5, delta: 2, status: 'Active' },
  { pts: '740', deliveries: 22, onTime: '72%', rank: 6, delta: -2, status: 'Inactive' },
];

const TABS = ['All', 'Active', 'Inactive'];

function getInitials(driver)
{
  if (driver.firstName && driver.lastName)
  {
    return `${driver.firstName[0]}${driver.lastName[0]}`;
  }
  return driver.username?.slice(0, 2)?.toUpperCase() ?? 'DR';
}

function getDriverId(driver)
{
  return `DRV-${String(driver.id ?? '').slice(-4).padStart(4, '0')}`;
}

export default function FleetMonitorTable()
{
  const { selectedOrgId } = useOrgContext();
  const { data: topDrivers, isError, isLoading } = useSponsorTopDrivers(selectedOrgId, 10);

  const [activeTab, setActiveTab] = useState('All');
  const { data: driversPage } = useSponsorOrgDrivers();
  const drivers = driversPage?.items ?? [];
  const driverCount = driversPage?.totalCount ?? drivers.length;

  const rows = topDrivers ? topDrivers.slice(0, 6).map((driver, i) => ({
    driver,
    stats: { pts: driver.monthlyNetPoints, rank: driver.rank, delta: 0, status: 'Active' },
  })) : [];

  const filtered = activeTab === 'All'
    ? rows
    : rows.filter(r => r.stats.status === activeTab);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Fleet Monitor</h3>
          <p className={styles.subtitle}>{driverCount} drivers · live activity</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.tabs}>
            {TABS.map(tab => (
              <button
                key={tab}
                className={clsx(styles.tab, activeTab === tab && styles.tabActive)}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <Link to="/org/drivers" className={styles.exportLink}>Export →</Link>
        </div>
      </div>

      {drivers && drivers.length > 0 &&
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Pts This Month</th>
                {/* <th>Deliveries</th>
              <th>On-Time</th> */}
                <th>Rank</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ driver, stats }) => (
                <tr key={driver.id ?? driver.username}>
                  <td>
                    <div className={styles.driverCell}>
                      <Avatar initials={getInitials(driver)} size={34} />
                      <div className={styles.driverInfo}>
                        <span className={styles.driverName}>
                          {driver.firstName} {driver.lastName}
                        </span>
                        <span className={styles.driverId}>{getDriverId(driver)}</span>
                      </div>
                    </div>
                  </td>
                  <td className={styles.pts}>{stats.pts}</td>
                  {/* <td>{stats.deliveries}</td>
                  <td>{stats.onTime}</td> */}
                  <td>
                    <div className={styles.rankCell}>
                      <span className={styles.rankNum}>#{stats.rank}</span>
                      {/* {stats.delta > 0 && <span className={styles.rankUp}>↑{stats.delta}</span>}
                    {stats.delta < 0 && <span className={styles.rankDown}>↓{Math.abs(stats.delta)}</span>}
                    {stats.delta === 0 && <span className={styles.rankFlat}>—</span>} */}
                    </div>
                  </td>
                  <td>
                    <span className={clsx(styles.statusBadge, stats.status === 'Active' ? styles.active : styles.inactive)}>
                      {stats.status}
                    </span>
                  </td>
                  <td>
                    <Link to={`/org/drivers/${driver.id}`} className={styles.manageLink}>
                      Manage →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
      {(!drivers || drivers.length == 0) &&
        <div className={styles.empty}>
          No drivers yet.
        </div>
      }

      <div className={styles.footer}>
        <span className={styles.showing}>Showing {filtered.length} of {driverCount} drivers</span>
        <Link to="/org/drivers" className={styles.viewAll}>View all {driverCount} →</Link>
      </div>
    </div>
  );
}
