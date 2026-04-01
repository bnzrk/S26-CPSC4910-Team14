import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../api/currentUser";
import { USER_TYPES } from '../constants/userTypes';

export default function GuestRoute({ children }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return null;

  if (user) {
    const dashboardRoute =
      user.userType === USER_TYPES.SPONSOR ? "/org" :
      user.userType === USER_TYPES.ADMIN   ? "/admin" :
      "/driver";
    return <Navigate to={dashboardRoute} replace />;
  }

  return children;
}