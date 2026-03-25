import DriverSidebar from '../Sidebar/DriverSidebar';
import DashboardHeader from '../DashboardHeader/DashboardHeader';
import { useCurrentUser } from '@/api/currentUser';
import styles from './DriverLayout.module.scss';

export default function DriverLayout({ children }) {
  const { data: user } = useCurrentUser();
  const initials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.slice(0, 2)?.toUpperCase() ?? 'DR';

  return (
    <div className={styles.layout}>
      <DriverSidebar />
      <div className={styles.body}>
        <DashboardHeader
          title="Driver Dashboard"
          subtitle="· February 2026"
          initials={initials}
          unreadCount={1}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
