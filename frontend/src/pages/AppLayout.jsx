import { useState, useEffect, useRef } from 'react';
import { useCurrentUser } from '@/api/currentUser';
import { USER_TYPES } from '@/constants/userTypes';
import { useLogout } from '@/api/auth';
import Navbar from '@/components/Navbar/NavBar';
import SponsorSidebar from '@/components/Sidebar/SponsorSidebar';
import DriverSidebar from '@/components/Sidebar/DriverSidebar';
import Button from '@/components/Button/Button';
import LogOutIcon from '@/assets/icons/log-out.svg?react';
import styles from './AppLayout.module.scss';
import clsx from 'clsx';

export default function AppLayout({ children })
{
  const { data: user } = useCurrentUser();

  const { mutate: logout } = useLogout();

  const isLoggedIn = !!user;
  const isDriver = user?.userType == USER_TYPES.DRIVER;
  const isSponsor = user?.userType == USER_TYPES.SPONSOR;
  const isAdmin = user?.userType == USER_TYPES.ADMIN;

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isImpersonationSession = user && user?.isImpersonating;

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
    const mediaQuery = window.matchMedia('(max-width: 720px)');
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
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
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
    <>
      <div className={clsx(styles.layout, isImpersonationSession && styles.withBanner)}>
        {isDriver && <DriverSidebar className={clsx(styles.menu, sidebarOpen && styles.open)} onClose={closeSideBar} />}
        {isSponsor && <SponsorSidebar className={clsx(styles.menu, sidebarOpen && styles.open)} onClose={closeSideBar} />}
        <div className={clsx((isLoggedIn && !isAdmin) && styles.withMenu, styles.body)}>
          <Navbar toggleSidebar={toggleSideBar} />
          {isImpersonationSession &&
            <div className={styles.banner}>
              <p>Logged in as {user?.email}</p>
              <Button
                className={styles.sessionButton}
                size='small'
                icon={LogOutIcon}
                text='End Session'
                onClick={logout}
              />
            </div>
          }
          <main className={clsx(styles.content)}>{children}</main>
        </div>
      </div>
    </>
  );
}
