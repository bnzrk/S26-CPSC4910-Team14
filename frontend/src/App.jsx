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
import PointRulesPage from './pages/SponsorOrg/PointsRules/PointRulesPage';
import PointsPage from './pages/Points/PointsPage'
import SponsorOrgLayout from './pages/SponsorOrg/SponsorOrgLayout';
import SponsorOrgPage from '@/pages/SponsorOrg/Index/SponsorOrgPage';
import SponsorUsersPage from './pages/SponsorOrg/Users/SponsorUsersPage';
import SponsorDriversPage from './pages/SponsorOrg/Drivers/Index/SponsorDriversPage';
import SponsorDriverPage from './pages/SponsorOrg/Drivers/Driver/SponsorDriverPage';
import RegisterPage from './pages/Register/RegisterPage';
import AdminToolsPage from './pages/Admin/Tools/AdminToolsPage';
import Navbar from './components/Navbar/NavBar';
import ProfilePage from './pages/Profile/ProfilePage';
import './App.scss';
import DriverApplicationPage from "./pages/DriverApplication/DriverApplicationPage";

export default function App() {
  const navigate = useNavigate();

  const { data: user, isLoading } = useCurrentUser();

  if (!isLoading)
    console.log(`Current user: ${JSON.stringify(user)}`);

  async function handleLogout()
  {
    try
    {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err)
    {
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
        <Route path="/register" element={
          <GuestRoute>
            <RegisterPage />
          </GuestRoute>
        } />
        <Route path="/driver-application" element={<DriverApplicationPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/points" element={
          <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER]}>
            <PointsPage />
          </ProtectedRoute>
        } />
        <Route path='/org' element={
          <ProtectedRoute allowedUserTypes={[USER_TYPES.SPONSOR]}>
            <SponsorOrgLayout />
          </ProtectedRoute>
        }>
          <Route index element={<SponsorOrgPage />} />
          <Route path="point-rules" element={<PointRulesPage />} />
          <Route path="users" element={<SponsorUsersPage />} />
          <Route path="drivers" element={<SponsorDriversPage />} />
          <Route path="drivers/:driverId" element={<SponsorDriverPage />} />
        </Route>
        <Route path="/admin" element={
          <ProtectedRoute allowedUserTypes={[USER_TYPES.ADMIN]}>
            <AdminToolsPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER, USER_TYPES.SPONSOR, USER_TYPES.ADMIN]}>
            <ProfilePage />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}