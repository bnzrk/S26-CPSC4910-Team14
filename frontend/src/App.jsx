import { Routes, Route, Navigate } from 'react-router-dom';
import { useCurrentUser } from "./api/currentUser";
import { USER_TYPES } from './constants/userTypes';
import { OrgProvider } from './contexts/OrgContext/OrgContext';
import { useDriverOrgs } from './api/driver';
import { useSponsorOrg } from './api/sponsorOrg';
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
import DriverApplicationPage from "./pages/DriverApplication/DriverApplicationPage";
import SponsorDriverApplicationsPage from './pages/SponsorOrg/Applications/SponsorDriverApplicationsPage';
import './App.scss';

export default function App()
{
  const { data: user, isLoading } = useCurrentUser();
  const isDriver = user?.userType == USER_TYPES.DRIVER;
  const isSponsor = user?.userType == USER_TYPES.SPONSOR;
  const { data: driverOrgs, isLoading: isDriverOrgsLoading, isError: isDriverOrgsError } = useDriverOrgs();
  const { data: sponsorOrg, isLoading: isSponsorOrgLoading, isError: isSponsorOrgError } = useSponsorOrg();

  const orgs = isDriver
    ? driverOrgs ?? []
    : isSponsor && sponsorOrg
      ? [sponsorOrg]
      : [];

  if (!isLoading)
    console.log(`Current user: ${JSON.stringify(user)}`);

  return (
    <>
      <OrgProvider user={user} orgs={orgs}>
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
          <Route path="/driver-application" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER]}>
              <DriverApplicationPage />
            </ProtectedRoute>
          } />
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
            <Route path="applications" element={<SponsorDriverApplicationsPage />} />
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
      </OrgProvider>
    </>
  );
}