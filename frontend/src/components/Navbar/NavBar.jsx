import { useCurrentUser } from "../../api/currentUser";
import { usePoints } from "@/api/points";
import { apiFetch } from "@/api/apiFetch";
import { queryClient } from "../../api/queryClient";
import { useNavigate, Link } from 'react-router-dom';
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import Button from "../Button/Button";
import Avatar from "../Avatar/Avatar";
import OrgSelector from "../OrgSelector/OrgSelector";
import BuildingIcon from "@/assets/icons/building-2.svg?react";
import StarIcon from "@/assets/icons/star.svg?react";
import ToolsIcon from "@/assets/icons/wrench.svg?react";
import UserIcon from '@/assets/icons/user-person.svg?react';
import styles from './NavBar.module.scss';
import clsx from "clsx";

export default function Navbar({ toggleSidebar })
{
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { selectedOrgId } = useOrgContext();
  const { data: points, isLoading: isPointsLoading } = usePoints(selectedOrgId);

  const isLoggedIn = !!currentUser;
  const isDriver = currentUser?.userType === 'Driver';
  const isSponsor = currentUser?.userType === 'Sponsor';
  const isAdmin = currentUser?.userType === 'Admin';

  const userInitials = currentUser?.firstName && currentUser?.lastName
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
    : currentUser?.email?.slice(0, 2)?.toUpperCase() ?? 'SP';

  function getRoleBadge()
  {
    if (isDriver) return { label: 'Driver', style: styles.roleDriver };
    if (isSponsor) return { label: 'Sponsor', style: styles.roleSponsor };
    if (isAdmin) return { label: 'Admin', style: styles.roleAdmin };
    return null;
  }

  const roleBadge = getRoleBadge();

  async function handleLogout()
  {
    try
    {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err)
    {
      console.error("Logout failed:", err);
    }
    queryClient.setQueryData(["currentUser"], null);
    navigate("/login");
  }

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.left}>
          {(!isLoggedIn || isAdmin) &&
            <Link to="/" className={styles.home}>
              DrivePoints
            </Link>
          }
        </div>

        <div className={styles.right}>
          {!isLoading && (
            isLoggedIn ? (
              <>
                {isDriver && (
                  <>
                    <OrgSelector />
                    <span
                      className={styles.points}
                      onClick={() => navigate("/driver/points")}
                    >
                      {isPointsLoading ? '…' : (points?.balance ?? 0)}
                      <StarIcon />
                    </span>
                  </>
                )}
                {isAdmin && (
                  <Button className={styles.button} onClick={() => navigate("/admin")} text='Tools' icon={ToolsIcon} />
                )}
                {userInitials && <Avatar className={styles.profile} initials={userInitials} size="md" onClick={() => navigate("/profile")} />}
                {userInitials && <Avatar className={styles.mobileMenu} initials={userInitials} size="md" onClick={toggleSidebar} />}
              </>
            ) : (
              <>
                <Button className={styles.button} onClick={() => navigate("/login")} text='Sign In' color='pill' />
                <Button className={styles.button} onClick={() => navigate("/register")} text='Get Started' color='pillWhite' />
              </>
            )
          )}
        </div>
      </nav>
    </>
  );
}
