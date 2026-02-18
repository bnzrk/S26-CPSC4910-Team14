import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { queryClient } from './api/queryClient';
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "./api/currentUser";
import { apiFetch } from "./api/apiFetch";
import GuestRoute from './routes/GuestRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import AboutPage from './pages/About/AboutPage';
import LoginPage from './pages/Login/LoginPage';
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
      <nav style={{ padding: '1rem', textAlign: 'right' }}>
        {!isLoading && (
          user ? (
            <>
              <span style={{ marginRight: "1rem" }}>
                {user?.email}
              </span>
              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">Sign In</Link>
          )
        )}
      </nav>
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/login" element={
          <GuestRoute>
            <LoginPage />
          </GuestRoute>
          } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}