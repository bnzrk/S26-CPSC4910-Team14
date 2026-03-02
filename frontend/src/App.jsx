import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { queryClient } from './api/queryClient';
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "./api/currentUser";
import { apiFetch } from "./api/apiFetch";
import { USER_TYPES } from './constants/userTypes';
import GuestRoute from './routes/GuestRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import AboutPage from './pages/About/AboutPage';
import LoginPage from './pages/Login/LoginPage';
import PointRulesPage from './pages/PointsRules/PointRulesPage';
import PointsPage from './pages/Points/PointsPage'
import SponsorOrgPage from '@/pages/SponsorOrg/SponsorOrgPage';
import RegisterPage from './pages/Register/RegisterPage';
import './App.scss';

export default function App() {
  const navigate = useNavigate();

  const { data: user, isLoading } = useCurrentUser();

  if (!isLoading)
    console.log(`Current user: ${JSON.stringify(user)}`);  

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    // Clear user
    queryClient.setQueryData(["currentUser"], null);

    navigate("/about");
  }

  return (
    <>
      <nav style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/about" style={{
          border: '1px solid var(--color-border)',
          borderRadius: '4px',
          padding: '0.4rem 1rem',
          textDecoration: 'none',
          color: 'var(--color-text)'
        }}>
          Home
        </Link>

        <div>
          {!isLoading && (
            user ? (
              <>
                {user.userType === 'Sponsor' && (
                  <Link to="/point-rules" style={{
                    border: '1px solid var(--color-border)',
                    borderRadius: '4px',
                    padding: '0.4rem 1rem',
                    marginRight: '1rem',
                    textDecoration: 'none',
                    color: 'var(--color-text)'
                  }}>
                    Point Rules
                  </Link>
                )}
                <span style={{ marginRight: "1rem" }}>
                  {user?.email}
                </span>
                <button onClick={handleLogout} style={{
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  padding: '0.4rem 1rem',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--color-text)'
                }}>
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" style={{
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                padding: '0.4rem 1rem',
                textDecoration: 'none',
                color: 'var(--color-text)'
              }}>
                Sign In
              </Link>
            )
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
        } />
        <Route path="/register" element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        } />
        <Route path="/org/point-rules" element={
          <ProtectedRoute allowedUserTypes={[USER_TYPES.SPONSOR]}>
            <PointRulesPage />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/points" element={
          <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER]}>
            <PointsPage />
          </ProtectedRoute>
        } />
        <Route path="/org" element={
          <ProtectedRoute allowedUserTypes={[USER_TYPES.SPONSOR]}>
            <SponsorOrgPage />
          </ProtectedRoute>
        }>  
        </Route>
      </Routes>
    </>
  );
}