import SponsorSidebar from '../Sidebar/SponsorSidebar';
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import { useCurrentUser } from '@/api/currentUser';
import { useSponsorOrg } from '@/api/sponsorOrg';
import styles from './SponsorLayout.module.scss';

export default function SponsorLayout({ children }) {
  const { data: user } = useCurrentUser();
  const { data: org } = useSponsorOrg();

  const orgName = org?.sponsorName ?? 'Your Org';
  const subtitle = `${orgName} · February 2026`;

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.slice(0, 2)?.toUpperCase() ?? 'SP';

  return (
    <div className={styles.layout}>
      <SponsorSidebar />
      <div className={styles.body}>
        <DashboardHeader
          title="Sponsor Dashboard"
          subtitle={subtitle}
          initials={userInitials}
          unreadCount={3}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
