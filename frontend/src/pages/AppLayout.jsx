import { useCurrentUser } from '@/api/currentUser';
import { useSponsorOrg } from '@/api/sponsorOrg';
import { USER_TYPES } from '@/constants/userTypes';
import Navbar from '@/components/Navbar/NavBar';
import SponsorSidebar from '@/components/Sidebar/SponsorSidebar';
import DashboardHeader from '@/components/DashboardHeader/DashboardHeader';
import styles from './AppLayout.module.scss';

export default function AppLayout({ children }) {
  const { data: user } = useCurrentUser();
  const { data: org } = useSponsorOrg();

  const isSponsor = user?.userType == USER_TYPES.SPONSOR;

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.slice(0, 2)?.toUpperCase() ?? 'SP';

  return (
    <div className={styles.layout}>
      {isSponsor && <SponsorSidebar />}
      <div className={styles.body}>
        <Navbar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
