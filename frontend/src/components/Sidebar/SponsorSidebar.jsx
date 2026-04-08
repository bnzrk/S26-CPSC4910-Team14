import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Avatar from '../Avatar/Avatar';
import BudgetWidget from '../BudgetWidget/BudgetWidget';
import NavBadge from '../NavBadge/NavBadge';
import { useSponsorOrg } from '@/api/sponsorOrg';
import { useCurrentUser } from '@/api/currentUser';
import { apiFetch } from '@/api/apiFetch';
import CloseIcon from '@/assets/icons/x.svg?react';
import styles from './SponsorSidebar.module.scss';
import clsx from 'clsx';
import { queryClient } from '@/api/queryClient';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ label: 'Dashboard', to: '/org' }],
  },
  {
    label: 'Fleet',
    items: [
      { label: 'Manage Drivers', to: '/org/drivers', badgeKey: 'pendingApps' },
      { label: 'Manage Users', to: '/org/users' },
      { label: 'Bulk Actions', to: '/org/bulk' },
    ],
  },
  {
    label: 'Rewards',
    items: [
      { label: 'Point Rules', to: '/org/point-rules', badge: 8 },
      { label: 'Catalog', to: '/org/catalog' },
    ],
  },
  {
    label: 'Account',
    items: [
      { label: 'My Profile', to: '/profile' },
      { label: 'Settings', to: '/org/settings' },
    ],
  },
];

async function handleLogout(navigate) {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout failed:', err);
  }
  queryClient.setQueryData(['currentUser'], null);
  navigate('/login');
}

export default function SponsorSidebar({ className, onClose }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { data: org } = useSponsorOrg();
  const { data: user } = useCurrentUser();

  const isSponsor = user?.userType?.toLowerCase() === 'sponsor';

  const orgInitials = org?.sponsorName
    ? org.sponsorName.slice(0, 2).toUpperCase()
    : 'SP';
  const orgName = org?.sponsorName ?? 'Your Org';
  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? '';

  const { data: applications = [] } = useQuery({
    queryKey: ['sponsor-applications'],
    queryFn: () => apiFetch('/applications').then(r => r.json()),
    staleTime: 30_000,
  });

  const pendingApps = applications.filter(a => {
    const s = a.status;
    return s === 0 || (typeof s === 'string' && s.toLowerCase() === 'pending');
  }).length;

  // add Admin section for sponsors
  const navGroups = [...NAV_GROUPS];
  if (isSponsor) {
    navGroups.push({
      label: 'Admin',
      items: [{ label: 'Audit Logs', to: '/org/audit-logs' }],
    });
  }

  return (
    <aside className={clsx(className, styles.sidebar)}>
      <div className={styles.logoArea}>
        <div className={styles.left}>
          <span className={styles.logo} onClick={() => navigate('/')}>
            DrivePoints
          </span>
          <span className={styles.portalBadge}>Sponsor Portal</span>
        </div>
        <div className={styles.close} onClick={onClose}>
          <CloseIcon />
        </div>
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
        {navGroups.map(group => (
          <div key={group.label} className={styles.group}>
            <span className={styles.groupLabel}>{group.label}</span>
            {group.items.map(item => {
              const count =
                item.badgeKey === 'pendingApps' ? pendingApps : item.badge ?? 0;
              const isActive =
                pathname === item.to ||
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