import { useCurrentUser } from "../../api/currentUser";
import { useLogout } from "@/api/auth";
import { usePoints } from "@/api/points";
import { apiFetch } from "@/api/apiFetch";
import { queryClient } from "../../api/queryClient";
import { useNavigate, Link } from 'react-router-dom';
import { useOrgContext } from "@/contexts/OrgContext/OrgContext";
import { useHelp } from "@/contexts/useHelp";
import Button from "../Button/Button";
import Avatar from "../Avatar/Avatar";
import OrgSelector from "../OrgSelector/OrgSelector";
import { CircleHelp } from 'lucide-react';
import StarIcon from "@/assets/icons/star.svg?react";
import ToolsIcon from "@/assets/icons/wrench.svg?react";
import styles from './NavBar.module.scss';

export default function Navbar({ toggleSidebar })
{
  const navigate = useNavigate();
  const { data: currentUser, isLoading } = useCurrentUser();
  const { selectedOrgId } = useOrgContext();
  const { data: points, isLoading: isPointsLoading } = usePoints(selectedOrgId);
  const { openHelp } = useHelp();

  const isLoggedIn = !!currentUser;
  const isDriver = currentUser?.userType?.toLowerCase() === 'driver';
  const isAdmin = currentUser?.userType?.toLowerCase() === 'admin';
  const isSponsor = currentUser?.userType?.toLowerCase() === 'sponsor';

  const userInitials = currentUser?.firstName && currentUser?.lastName
    ? `${currentUser.firstName[0]}${currentUser.lastName[0]}`
    : currentUser?.email?.slice(0, 2)?.toUpperCase() ?? 'SP';

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.left}>
          {(!isLoggedIn || isAdmin) &&
            <Link to="/" className={styles.home}>DrivePoints</Link>
          }
        </div>

        <div className={styles.right}>
          {!isLoading && (
            isLoggedIn ? (
              <>
                {isDriver && selectedOrgId && (
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
                <button
                  className={styles.helpBtn}
                  onClick={openHelp}
                  title="Help and Support"
                  aria-label="Help and Support"
                >
                  <CircleHelp size={20} />
                </button>
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
