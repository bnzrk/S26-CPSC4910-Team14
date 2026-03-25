import { Link, useLocation } from 'react-router-dom';
import Avatar from '../Avatar/Avatar';
import BudgetWidget from '../BudgetWidget/BudgetWidget';
import NavBadge from '../NavBadge/NavBadge';
import styles from './SponsorSidebar.module.scss';
import clsx from 'clsx';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', to: '/org' },
      { label: 'Reports', to: '/org/reports' },
    ],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Drivers', to: '/org/drivers' },
      { label: 'Applications', to: '/org/applications', badge: 8, badgeColor: 'amber' },
    ],
  },
  {
    label: 'Rewards',
    items: [
      { label: 'Catalog', to: '/org/catalog' },
      { label: 'Point Rules', to: '/org/points' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Settings', to: '/org/settings' },
    ],
  },
];

export default function SponsorSidebar({ org, user, budgetUsed, budgetTotal, budgetResetLabel }) {
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <span className={styles.logo}>DrivePoints</span>
        <span className={styles.portalBadge}>Sponsor Portal</span>
      </div>

      {(org || user) && (
        <div className={styles.profile}>
          <Avatar initials={org?.initials ?? org?.name?.slice(0, 2) ?? 'SP'} size="lg" shape="rounded" />
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{org?.name ?? 'Your Org'}</span>
            <span className={styles.profileRole}>{user?.role ?? 'Sponsor Admin'}</span>
          </div>
        </div>
      )}

      <nav className={styles.nav}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            {group.items.map(item => (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(styles.navItem, pathname === item.to && styles.active)}
              >
                <span>{item.label}</span>
                {item.badge && <NavBadge count={item.badge} color={item.badgeColor ?? 'green'} />}
              </Link>
            ))}
          </div>
        ))}
      </nav>

      {budgetTotal > 0 && (
        <div className={styles.budgetArea}>
          <BudgetWidget used={budgetUsed} total={budgetTotal} resetLabel={budgetResetLabel} />
        </div>
      )}
    </aside>
  );
}
