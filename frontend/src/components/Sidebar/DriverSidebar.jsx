import { Link, useLocation } from 'react-router-dom';
import Avatar from '../Avatar/Avatar';
import PointCard from '../PointCard/PointCard';
import NavBadge from '../NavBadge/NavBadge';
import styles from './DriverSidebar.module.scss';
import clsx from 'clsx';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', to: '/dashboard' },
      { label: 'My Points', to: '/points' },
    ],
  },
  {
    label: 'Rewards',
    items: [
      { label: 'Catalog', to: '/catalog' },
      { label: 'Orders', to: '/orders', badge: 3 },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', to: '/profile' },
      { label: 'Notifications', to: '/notifications', badge: 5, badgeColor: 'amber' },
    ],
  },
];

export default function DriverSidebar({ user, points, dollarValue }) {
  const { pathname } = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <span className={styles.logo}>DrivePoints</span>
      </div>

      {user && (
        <div className={styles.profile}>
          <Avatar initials={user.initials ?? user.name?.slice(0, 2) ?? 'DR'} size="lg" />
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{user.name}</span>
            <span className={styles.profileOrg}>{user.org}</span>
          </div>
        </div>
      )}

      <div className={styles.pointsArea}>
        <PointCard points={points} dollarValue={dollarValue} ctaLabel="Shop Catalog" onCta={() => {}} />
      </div>

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
    </aside>
  );
}
