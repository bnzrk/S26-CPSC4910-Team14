import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { queryClient } from './api/queryClient';
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "./api/currentUser";
import { apiFetch } from "./api/apiFetch";
import GuestRoute from './routes/GuestRoute';
import ProtectedRoute from './routes/ProtectedRoute';
import AboutPage from './pages/About/AboutPage';
import LoginPage from './pages/Login/LoginPage';
import Navbar from './pages/About/components/NavBar';
import './App.scss';


// Main application component
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
      <Navbar />
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