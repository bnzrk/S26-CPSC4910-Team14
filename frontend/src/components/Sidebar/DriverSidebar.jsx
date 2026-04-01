import { Link, useLocation, useNavigate } from 'react-router-dom';
import Avatar from '../Avatar/Avatar';
import PointCard from '../PointCard/PointCard';
import NavBadge from '../NavBadge/NavBadge';
import { usePoints } from '@/api/points';
import { useCurrentUser } from '@/api/currentUser';
import { useOrgContext } from '@/contexts/OrgContext/OrgContext';
import { useDriverOrgs } from '@/api/driver';
import CloseIcon from '@/assets/icons/x.svg?react';
import styles from './DriverSidebar.module.scss';
import clsx from 'clsx';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', to: '/driver', icon: 'grid' },
      { label: 'My Points', to: '/driver/points', icon: 'star' },
      { label: 'Organizations', to: '/organizations', icon: 'building' },
      { label: 'Deliveries', to: '/deliveries', icon: 'truck', badge: 3 },
      { label: 'Challenges', to: '/challenges', icon: 'zap' },
      { label: 'Leaderboard', to: '/leaderboard', icon: 'trophy' },
    ],
  },
  {
    label: 'Rewards',
    items: [
      { label: 'Redeem Points', to: '/shop', icon: 'gift' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'Profile', to: '/profile', icon: 'user' },
      { label: 'Settings', to: '/settings', icon: 'settings' },
    ],
  },
];

function NavIcon({ name }) {
  const icons = {
    grid: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
    coins: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
        <path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>
      </svg>
    ),
    truck: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      </svg>
    ),
    zap: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    trophy: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
      </svg>
    ),
    gift: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
        <path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
      </svg>
    ),
    star: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    user: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    settings: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
    building: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20"/><path d="M9 22v-4h6v4"/>
        <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
      </svg>
    ),
  };
  return icons[name] ?? null;
}

export default function DriverSidebar({ className, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: user } = useCurrentUser();
  const { selectedOrgId } = useOrgContext();
  const { data: points } = usePoints(selectedOrgId);
  const { data: orgs } = useDriverOrgs();

  const org = orgs?.find(o => o.id == selectedOrgId);
  const pointRatio = org?.pointRatio ?? 0.01;
  const balance = points?.balance ?? 0;
  const dollarValue = `$${(balance * pointRatio).toFixed(2)} USD`;

  const firstName = user?.firstName ?? '';
  const lastName = user?.lastName ?? '';
  const fullName = firstName || lastName ? `${firstName} ${lastName}`.trim() : (user?.email ?? 'Driver');
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`
    : fullName.slice(0, 2).toUpperCase();

  return (
    <aside className={clsx(className, styles.sidebar)}>
      {/* Logo */}
      <div className={styles.logoArea}>
        <span className={styles.logo}>
          <span className={styles.logoDrive}>Drive</span>
          <span className={styles.logoPoints}>Points</span>
        </span>
        <div className={styles.close} onClick={onClose}>
          <CloseIcon />
        </div>
      </div>

      {/* Profile */}
      <div className={styles.profile}>
        <Avatar initials={initials} size="md" />
        <div className={styles.profileInfo}>
          <span className={styles.profileName}>{fullName}</span>
          <span className={styles.profileOrg}>{org?.name ?? 'No sponsor'}</span>
          <span className={styles.rankBadge}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Rank #3 of 32
          </span>
        </div>
      </div>

      {/* Points card */}
      <div className={styles.pointsArea}>
        <PointCard className={styles.points} points={balance} onClick={() => navigate("/driver/points")} />
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV_GROUPS.map(group => (
          <div key={group.label} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            {group.items.map(item => (
              <Link
                key={item.label}
                to={item.to}
                className={clsx(styles.navItem, pathname === item.to && styles.active)}
              >
                <span className={styles.navItemInner}>
                  <span className={styles.navIcon}><NavIcon name={item.icon} /></span>
                  <span>{item.label}</span>
                </span>
                {item.badge && <NavBadge count={item.badge} color="green" />}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
