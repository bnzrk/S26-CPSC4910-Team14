import { useCurrentUser } from "../../api/currentUser";
import { usePoints } from "@/api/points";
import { apiFetch } from "../../api/apiFetch";
import { queryClient } from "../../api/queryClient";
import { useNavigate, Link } from 'react-router-dom';
import styles from './Navbar.module.scss';

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
    if (isDriver) return { label: 'Driver', color: '#4caf50' };
    if (isSponsor) return { label: 'Sponsor', color: '#2196f3' };
    if (isAdmin) return { label: 'Admin', color: '#ff9800' };
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
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: '60px', backgroundColor: '#3d3d3d', color: 'white' }}>
      <div>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: '700', fontSize: '1.2rem' }}>
          Good Driver Incentive
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {!isLoading && (
          isLoggedIn ? (
            <>
              <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>{currentUser.email}</span>

              {/* Adding the role title to navbar */}
              {roleBadge && (
                <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.2rem 0.6rem', borderRadius: '999px', backgroundColor: roleBadge.color, color: 'white' }}>
                  {roleBadge.label}
                </span>
              )}

              {/* Only driver users should show points */}
              {isDriver && (  
                <span
                  className={styles.points}
                  onClick={() => navigate("/points")}
                >
                  🏆 {points ?? 0} pts
                </span>
              )}
              <Link to="/profile" style={{ padding: '0.4rem 1rem', border: '2px solid white', borderRadius: '6px', color: 'white', textDecoration: 'none' }}>
                Profile
              </Link>
              <button onClick={handleLogout} style={{ padding: '0.4rem 1rem', border: '2px solid white', borderRadius: '6px', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ padding: '0.4rem 1rem', border: '2px solid white', borderRadius: '6px', color: 'white', textDecoration: 'none' }}>Log In</Link>
              <Link to="/register" style={{ padding: '0.4rem 1rem', borderRadius: '6px', background: 'white', color: '#2d2d2d', textDecoration: 'none' }}>Register</Link>
            </>
          )
        )}
      </div>
    </nav>
  );
}