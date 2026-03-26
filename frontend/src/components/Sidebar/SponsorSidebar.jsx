import { Link, useLocation } from 'react-router-dom';
import Avatar from '../Avatar/Avatar';
import BudgetWidget from '../BudgetWidget/BudgetWidget';
import NavBadge from '../NavBadge/NavBadge';
import { useSponsorOrg, useSponsorOrgDrivers } from '@/api/sponsorOrg';
import { useCurrentUser } from '@/api/currentUser';
import styles from './SponsorSidebar.module.scss';
import clsx from 'clsx';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/org' },
      { label: 'Analytics', to: '/org/analytics' },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Drivers', to: '/org/drivers', badgeKey: 'driverCount' },
      { label: 'Deliveries', to: '/org/deliveries' },
      { label: 'Routes', to: '/org/routes' },
    ],
  },
  {
    label: 'Rewards',
    items: [
      { label: 'Point Rules', to: '/org/point-rules', badge: 8 },
      { label: 'Challenges', to: '/org/challenges' },
      { label: 'Redemptions', to: '/org/redemptions' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', to: '/org/settings' },
      { label: 'My Profile', to: '/profile' },
    ],
  },
];

export default function SponsorSidebar() {
  const { pathname } = useLocation();
  const { data: org } = useSponsorOrg();
  const { data: user } = useCurrentUser();
  const { data: drivers } = useSponsorOrgDrivers();

  const orgInitials = org?.sponsorName
    ? org.sponsorName.slice(0, 2).toUpperCase()
    : 'SP';
  const orgName = org?.sponsorName ?? 'Your Org';
  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.email ?? '';
  const driverCount = drivers?.length ?? 0;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <span className={styles.logo}>DrivePoints</span>
        <span className={styles.portalBadge}>Sponsor Portal</span>
      </div>

      <div className={styles.profile}>
        <Avatar initials={orgInitials} size="lg" shape="rounded" />
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{orgName}</span>
          <span className={styles.profileRole}>Fleet Manager · {userName}</span>
          <span className={styles.planBadge}>⭐ Pro Plan</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            {group.items.map(item => {
              const count = item.badgeKey === 'driverCount' ? driverCount : item.badge;
              const isActive = pathname === item.to ||
                (item.to !== '/org' && pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={clsx(styles.navItem, isActive && styles.active)}
                >
                  <span>{item.label}</span>
                  {count > 0 && <NavBadge count={count} color="green" />}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.budgetArea}>
        <BudgetWidget used={3840} total={5000} resetLabel="resets Mar 1" />
      </div>
    </aside>
  );
}
