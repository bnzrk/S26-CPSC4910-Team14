import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import SponsorDashboardPage from '@/pages/SponsorOrg/SponsorDashboardPage';
import SponsorUsersPage from './pages/SponsorOrg/Users/SponsorUsersPage';
import SponsorDriversPage from './pages/SponsorOrg/Drivers/Index/SponsorDriversPage';
import SponsorDriverPage from './pages/SponsorOrg/Drivers/Driver/SponsorDriverPage';
import ShopPage from './pages/Shop/ShopPage';
import RegisterPage from './pages/Register/RegisterPage';
import AdminToolsPage from './pages/Admin/Tools/AdminToolsPage';
import ProfilePage from './pages/Profile/ProfilePage';
import DriverApplicationPage from "./pages/DriverApplication/DriverApplicationPage";
import SponsorDriverApplicationsPage from './pages/SponsorOrg/Applications/SponsorDriverApplicationsPage';
import DriverLayout from './components/DriverLayout/DriverLayout';
import SponsorCatalogPage from './pages/SponsorOrg/Catalog/SponsorCatalogPage';
import ManageDriversPage from './pages/SponsorOrg/ManageDrivers/ManageDriversPage';
import OrganizationsPage from './pages/Organizations/OrganizationsPage';
import ComingSoonPage from './pages/ComingSoon/ComingSoonPage';
import AppLayout from './pages/AppLayout';
import DriverDashboardPage from './pages/DriverDashboard/DriverDashboardPage';
import AuditLogPage from './pages/Admin/AuditLogs/AuditLogPage';
import './App.scss';


function AppContent({ user, orgs })
{
  return (
    <OrgProvider user={user} orgs={orgs}>
      <AppLayout>
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
          <Route path='/shop' element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER]}>
              <ShopPage />
            </ProtectedRoute>
          } />
          <Route path='/organizations' element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER]}>
              <DriverLayout>
                <OrganizationsPage />
              </DriverLayout>
            </ProtectedRoute>
          } />
          <Route path='/driver' element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER]}>
              <DriverLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DriverDashboardPage />} />
            <Route path="points" element={<PointsPage />} />
          </Route>
          <Route path='/org' element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.SPONSOR]}>
              <SponsorOrgLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SponsorDashboardPage />} />
            <Route path="point-rules" element={<PointRulesPage />} />
            <Route path="users" element={<SponsorUsersPage />} />
            <Route path="drivers" element={<SponsorDriversPage />} />
            <Route path="drivers/:driverId" element={<SponsorDriverPage />} />
            <Route path="applications" element={<SponsorDriverApplicationsPage />} />
            <Route path="catalog" element={<SponsorCatalogPage />} />
            <Route path="catalog" element={<SponsorCatalogPage />} />
            <Route path="manage-drivers" element={<ManageDriversPage />} />
            <Route path="settings" element={<ComingSoonPage title="Settings" />} />
            <Route path="deliveries" element={<ComingSoonPage title="Deliveries" />} />
            <Route path="routes" element={<ComingSoonPage title="Routes" />} />
          </Route>
          <Route path="/admin" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.ADMIN]}>
              <AdminToolsPage />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.ADMIN]}>
              <AuditLogPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER, USER_TYPES.SPONSOR, USER_TYPES.ADMIN]}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </OrgProvider>
  );
}

export default function App()
{
  const { data: user, isLoading } = useCurrentUser();
  const isDriver = user?.userType == USER_TYPES.DRIVER;
  const isSponsor = user?.userType == USER_TYPES.SPONSOR;
  const { data: driverOrgs } = useDriverOrgs();
  const { data: sponsorOrg } = useSponsorOrg();

  const orgs = isDriver
    ? driverOrgs ?? []
    : isSponsor && sponsorOrg
      ? [sponsorOrg]
      : [];

  if (!isLoading)
    console.log(`Current user: ${JSON.stringify(user)}`);

  return <AppContent user={user} orgs={orgs} />;
}