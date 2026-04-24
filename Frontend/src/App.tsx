import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "./app/hooks";
import { logout } from "./features/auth/authSlice";
import { AppRouter } from "./routes/AppRouter";

function AuthSessionListener() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handleExpiredSession = () => {
      dispatch(logout());
      navigate("/login", { replace: true });
    };

    window.addEventListener("admin-auth-expired", handleExpiredSession);
    return () => window.removeEventListener("admin-auth-expired", handleExpiredSession);
  }, [dispatch, navigate]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthSessionListener />
      <AppRouter />
    </BrowserRouter>
  );
}
