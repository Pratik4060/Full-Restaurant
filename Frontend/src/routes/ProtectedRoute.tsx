import { Navigate } from "react-router-dom";
import { useAppSelector } from "../app/hooks";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}