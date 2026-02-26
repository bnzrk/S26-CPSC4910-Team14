import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { API_URL } from '../../config';
import styles from './Navbar.module.scss';

// Navigation bar component
export default function Navbar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/auth/me`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  const isLoggedIn = !!currentUser;
  const isDriver = currentUser?.role === 'Driver'; 

  async function handleLogout() {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    queryClient.clear();
    navigate('/login');
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <Link to="/">Good Driver Incentive</Link>
      </div>

      <div className={styles.actions}>
        {isLoggedIn ? (
          <>
            {isDriver && (
              <span className={styles.points}>
                🏆 {currentUser.totalPoints ?? 0} pts
              </span>
            )}
            <button onClick={handleLogout} className={styles.btnOutline}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.btnOutline}>Log In</Link>
            <Link to="/register" className={styles.btnPrimary}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}