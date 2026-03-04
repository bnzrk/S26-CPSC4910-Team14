import { useCurrentUser } from "../../api/currentUser";
import { usePoints } from "@/api/points";
import { apiFetch } from "../../api/apiFetch";
import { queryClient } from "../../api/queryClient";
import { useNavigate, Link } from 'react-router-dom';
import Button from "../Button/Button";
import BuildingIcon from "@/assets/icons/building-2.svg?react";
import StarIcon from "@/assets/icons/star.svg?react";
import styles from './Navbar.module.scss';
import clsx from "clsx";

export default function Navbar()
{
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { data: points, isLoading: isPointsLoading } = usePoints();

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
    <nav className={styles.navbar}>
      <div>
        <Link to="/" className={styles.home}>
          DrivePoints
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isLoading && (
          isLoggedIn ? (
            <>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{currentUser.email}</span>

              {/* Adding the role title to navbar */}
              {roleBadge && (
                <span className={clsx(styles.roleBadge, roleBadge.style )}>
                  {roleBadge.label}
                </span>
              )}

              {/* Only driver users should show points */}
              {isDriver && (
                <span
                  className={styles.points}
                  onClick={() => navigate("/points")}
                >
                  {points ?? 0}
                  <StarIcon />
                </span>
              )}

              {isSponsor && (
                <Button className={styles.button} onClick={() => navigate("/org")} text='Organization' color='primary' icon={BuildingIcon} />
              )}

              <Button className={styles.button} onClick={handleLogout} text='Logout' />
            </>
          ) : (
            <>
              <Button className={styles.button} onClick={() => navigate("/login")} text='Login' />
              <Button className={styles.button} onClick={() => navigate("/register")} text='Register' color='primary' />
            </>
          )
        )}
      </div>
    </nav>
  );
}