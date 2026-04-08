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
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import ComingSoonPage from './pages/ComingSoon/ComingSoonPage';

// Driver Pages
import DriverLayout from './components/DriverLayout/DriverLayout';
import DriverDashboardPage from './pages/DriverDashboard/DriverDashboardPage';
import PointsPage from './pages/Points/PointsPage';
import OrganizationsPage from './pages/Organizations/OrganizationsPage';
import DriverApplicationPage from "./pages/DriverApplication/DriverApplicationPage";
import ShopPage from './pages/Shop/ShopPage';

// Sponsor Pages
import SponsorOrgLayout from './pages/SponsorOrg/SponsorOrgLayout';
import SponsorDashboardPage from '@/pages/SponsorOrg/SponsorDashboardPage';
import PointRulesPage from './pages/SponsorOrg/PointsRules/PointRulesPage';
import SponsorUsersPage from './pages/SponsorOrg/Users/SponsorUsersPage';
import ManageDriversPage from './pages/SponsorOrg/ManageDrivers/ManageDriversPage';
import SponsorDriverPage from './pages/SponsorOrg/Drivers/Driver/SponsorDriverPage';
import SponsorDriverApplicationsPage from './pages/SponsorOrg/Applications/SponsorDriverApplicationsPage';
import SponsorCatalogPage from './pages/SponsorOrg/Catalog/SponsorCatalogPage';
import SponsorBulkActionsPage from './pages/SponsorOrg/BulkActions/SponsorBulkActionsPage';
import AuditLogPage from './pages/Admin/AuditLogs/AuditLogPage';

// Admin Pages
import AdminToolsLayout from './pages/Admin/AdminToolsLayout';
import AdminDashboardPage from './pages/Admin/Dashboard/AdminDashboardPage';
import AdminOrgsPage from './pages/Admin/Orgs/AdminOrgsPage';
import UsersPage from './pages/Admin/Users/UsersPage';
import AdminBulkActionsPage from './pages/Admin/BulkActions/AdminBulkActionsPage';

import AppLayout from './pages/AppLayout';
import './App.scss';

function AppContent({ user, isUserLoading, orgs }) {
  return (
    <OrgProvider user={user} orgs={orgs}>
      <AppLayout>
        <Routes>
          {/* Root redirect based on user type */}
          <Route path="/" element={
            isUserLoading ? <div></div> :
              user?.userType === USER_TYPES.DRIVER ? <Navigate to="/driver" replace /> :
              user?.userType === USER_TYPES.SPONSOR ? <Navigate to="/org" replace /> :
              user?.userType === USER_TYPES.ADMIN ? <Navigate to="/admin" replace /> :
              <Navigate to="/about" replace />
          } />

          {/* Public pages */}
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

          {/* Driver routes */}
          <Route path="/driver" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER]}>
              <DriverLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DriverDashboardPage />} />
            <Route path="points" element={<PointsPage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="organizations" element={<OrganizationsPage />} />
          </Route>

          <Route path="/driver-application" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER]}>
              <DriverApplicationPage />
            </ProtectedRoute>
          } />

          {/* Sponsor routes */}
          <Route path="/org" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.SPONSOR]}>
              <SponsorOrgLayout />
            </ProtectedRoute>
          }>
            <Route index element={<SponsorDashboardPage />} />
            <Route path="point-rules" element={<PointRulesPage />} />
            <Route path="users" element={<SponsorUsersPage />} />
            <Route path="drivers" element={<ManageDriversPage />} />
            <Route path="drivers/:driverId" element={<SponsorDriverPage />} />
            <Route path="applications" element={<SponsorDriverApplicationsPage />} />
            <Route path="catalog" element={<SponsorCatalogPage />} />
            <Route path="settings" element={<ComingSoonPage title="Settings" />} />
            <Route path="deliveries" element={<ComingSoonPage title="Deliveries" />} />
            <Route path="routes" element={<ComingSoonPage title="Routes" />} />
            <Route path="bulk" element={<SponsorBulkActionsPage />} />
            {/* Sponsor audit logs route */}
            <Route path="audit-logs" element={<AuditLogPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.ADMIN]}>
              <AdminToolsLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboardPage />} />
            <Route path="orgs" element={<AdminOrgsPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="bulk" element={<AdminBulkActionsPage />} />
            {/* Admin audit logs route */}
            <Route path="audit-logs" element={<AuditLogPage />} />
          </Route>

          {/* Profile route */}
          <Route path="/profile" element={
            <ProtectedRoute allowedUserTypes={[USER_TYPES.DRIVER, USER_TYPES.SPONSOR, USER_TYPES.ADMIN]}>
              <ProfilePage />
            </ProtectedRoute>
          } />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </OrgProvider>
  );
}

export default function App() {
  const { data: user, isLoading } = useCurrentUser();
  const isDriver = user?.userType === USER_TYPES.DRIVER;
  const isSponsor = user?.userType === USER_TYPES.SPONSOR;
  const { data: driverOrgs } = useDriverOrgs();
  const { data: sponsorOrg } = useSponsorOrg();

  const orgs = isDriver
    ? driverOrgs ?? []
    : isSponsor && sponsorOrg
      ? [sponsorOrg]
      : [];

  return <AppContent user={user} isUserLoading={isLoading} orgs={orgs} />;
}