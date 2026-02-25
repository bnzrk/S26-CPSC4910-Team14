import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../api/currentUser";

export default function ProtectedRoute({ children, allowedUserTypes }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) 
    return null;
  
  if (!user) 
    return <Navigate to="/login" replace />;

  if (allowedUserTypes && !allowedUserTypes.includes(user.userType))
    return <Navigate to="/" replace />;

  return children;
}
