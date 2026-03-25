import { useCurrentUser } from "../../api/currentUser";
import { usePoints } from "@/api/points";
import { apiFetch } from "@/api/apiFetch";
import { queryClient } from "../../api/queryClient";
import { useNavigate, Link } from 'react-router-dom';
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import Button from "../Button/Button";
import OrgSelector from "../OrgSelector/OrgSelector";
import BuildingIcon from "@/assets/icons/building-2.svg?react";
import StarIcon from "@/assets/icons/star.svg?react";
import ToolsIcon from "@/assets/icons/wrench.svg?react";
import UserIcon from '@/assets/icons/user-person.svg?react';
import styles from './NavBar.module.scss';
import clsx from "clsx";

export default function Navbar()
{
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { selectedOrgId } = useOrgContext();
  const { data: points, isLoading: isPointsLoading } = usePoints(selectedOrgId);

  const isLoggedIn = !!currentUser;
  const isDriver = currentUser?.userType === 'Driver';
  const isSponsor = currentUser?.userType === 'Sponsor';
  const isAdmin = currentUser?.userType === 'Admin';

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
          <Link to="/" className={styles.home}>
            DrivePoints
          </Link>
        </div>

        <div className={styles.right}>
          {!isLoading && (
            isLoggedIn ? (
              <>
                <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{currentUser.email}</span>

                {roleBadge && (
                  <span className={clsx(styles.roleBadge, roleBadge.style)}>
                    {roleBadge.label}
                  </span>
                )}

                {isDriver && (
                  <>
                    <OrgSelector />
                    <span
                      className={styles.points}
                      onClick={() => navigate("/points")}
                    >
                      {isPointsLoading ? '…' : (points?.balance ?? 0)}
                      <StarIcon />
                    </span>
                  </>
                )}
                {isSponsor && (
                  <Button className={styles.button} onClick={() => navigate("/org")} text='Organization' color='primary' icon={BuildingIcon} />
                )}

                {isAdmin && (
                  <Button className={styles.button} onClick={() => navigate("/admin")} text='Tools' icon={ToolsIcon} />
                )}
                <button type="button" className={styles.profile} onClick={() => navigate("/profile")}>
                  <div className={styles.profileIconWrapper}>
                    <UserIcon />
                  </div>
                </button>
                <Button className={styles.button} onClick={handleLogout} text='Logout' />
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
