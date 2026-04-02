import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from '@/api/currentUser';
import { useSponsorOrg } from '@/api/sponsorOrg';
import { USER_TYPES } from '@/constants/userTypes';
import Navbar from '@/components/Navbar/NavBar';
import SponsorSidebar from '@/components/Sidebar/SponsorSidebar';
import DriverSidebar from '@/components/Sidebar/DriverSidebar';
import styles from './AppLayout.module.scss';
import clsx from 'clsx';

export default function AppLayout({ children })
{
  const { data: user } = useCurrentUser();

  const isLoggedIn = !!user;
  const isDriver = user?.userType == USER_TYPES.DRIVER;
  const isSponsor = user?.userType == USER_TYPES.SPONSOR;
  const isAdmin = user?.userType == USER_TYPES.ADMIN;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSideBar = () =>
  {
    setSidebarOpen(!sidebarOpen);
  }

  const closeSideBar = () =>
  {
    setSidebarOpen(false);
  }

  // Clear scroll lock and close sidebar when no longer mobile sized
  const bodyRef = useRef(null);

  useEffect(() =>
  {
    const mediaQuery = window.matchMedia('(max-width: 540px)');
    const handleResize = () =>
    {
      if (!mediaQuery.matches)
      {
        setSidebarOpen(false);
        if (bodyRef.current) bodyRef.current.style.overflow = '';
      }
    };
    mediaQuery.addEventListener('change', handleResize);
    return () => mediaQuery.removeEventListener('change', handleResize);
  }, []);

  useEffect(() =>
  {
    const isMobile = window.matchMedia('(max-width: 540px)').matches;
    if (isMobile && bodyRef.current)
    {
      bodyRef.current.style.overflow = sidebarOpen ? 'hidden' : '';
    }
    return () =>
    {
      if (bodyRef.current) bodyRef.current.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className={styles.layout}>
      {isDriver && <DriverSidebar className={clsx(styles.menu, sidebarOpen && styles.open)} onClose={closeSideBar} />}
      {isSponsor && <SponsorSidebar className={clsx(styles.menu, sidebarOpen && styles.open)} onClose={closeSideBar} />}
      <div className={styles.body}>
        <Navbar toggleSidebar={toggleSideBar} />
        <main className={clsx(styles.content, (isLoggedIn && !isAdmin) && styles.withMenu)}>{children}</main>
      </div>
    </div>
  );
}
