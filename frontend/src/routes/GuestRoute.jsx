import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../api/currentUser";

export default function GuestRoute({ children }) {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) return null;

  if (user) return <Navigate to="/about" replace />;

  return children;
}