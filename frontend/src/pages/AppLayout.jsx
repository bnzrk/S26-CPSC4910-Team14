import { useCurrentUser } from '@/api/currentUser';
import { useSponsorOrg } from '@/api/sponsorOrg';
import { USER_TYPES } from '@/constants/userTypes';
import Navbar from '@/components/Navbar/NavBar';
import SponsorSidebar from '@/components/Sidebar/SponsorSidebar';
import DriverSidebar from '@/components/Sidebar/DriverSidebar';
import styles from './AppLayout.module.scss';
import clsx from 'clsx';

export default function AppLayout({ children }) {
  const { data: user } = useCurrentUser();
  const { data: org } = useSponsorOrg();

  const isLoggedIn = !!user;
  const isDriver = user?.userType == USER_TYPES.DRIVER;
  const isSponsor = user?.userType == USER_TYPES.SPONSOR;
  const isAdmin = user?.userType == USER_TYPES.ADMIN;

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.slice(0, 2)?.toUpperCase() ?? 'SP';

  return (
    <div className={styles.layout}>
      {isDriver && <DriverSidebar className={styles.sidebar}/>}
      {isSponsor && <SponsorSidebar className={styles.sidebar}/>}
      <div className={styles.body}>
        <Navbar />
        <main className={clsx(styles.content, (isLoggedIn && !isAdmin) && styles.withSidebar)}>{children}</main>
      </div>
    </div>
  );
}
