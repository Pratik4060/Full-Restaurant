import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { loginThunk } from "../features/auth/authSlice";

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, loading, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("admin@zhonix.com");
  const [password, setPassword] = useState("admin123");

  useEffect(() => {
    if (token) navigate("/dashboard");
  }, [token, navigate]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await dispatch(loginThunk({ email, password }));
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#f5f3ef] md:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(30,20,12,0.18),rgba(30,20,12,0.28))]" />
      </div>

      <div className="grid place-items-center p-6 md:p-10">
        <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-2xl border border-[#e6ddd0] bg-white p-8 shadow-[0_18px_44px_rgba(44,33,18,0.10)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white">
            RMS
          </div>
          <div className="text-center">
            <p className="text-sm text-[#5f584f]">Restaurant Management System</p>
            <h1 className="mt-3 text-2xl font-semibold text-[#1f1f1f]">Admin Panel</h1>
          </div>
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm text-[#d45d5d]">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
