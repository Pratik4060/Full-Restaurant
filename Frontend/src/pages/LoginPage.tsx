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
    <div className="grid min-h-screen grid-cols-1 bg-[#f5f3ef] md:grid-cols-[0.95fr_1.05fr]">
      <div className="relative hidden overflow-hidden bg-[#2d241d] md:flex md:items-center md:justify-center">
        <img
          src="/assets/loginPage.svg"
          alt="Restaurant interior"
          className="h-full w-full object-contain"
        />
      </div>

      <div className="grid place-items-center bg-[#f8f8f8] p-6 md:p-10">
        <form
          onSubmit={submit}
          className="w-full max-w-[380px] space-y-5 rounded-[4px] border border-[#ece7de] bg-white px-7 py-7 shadow-[0_12px_32px_rgba(44,33,18,0.14)]"
        >
          <div className="text-center">
            <img
              src="/assets/logo.svg"
              alt="Restaurant logo"
              className="mx-auto h-[78px] w-[78px] rounded-[6px] object-cover"
            />
            <p className="mt-5 text-[13px] text-[#2b241d]">Restaurant Management System</p>
            <h1 className="mt-5 text-[18px] font-semibold text-[#1f1f1f]">Admin Panel</h1>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] text-[#514a42]">Email Address</label>
              <Input
                placeholder="admin@zhonix.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 rounded-[3px] border-[#d9d4cb] bg-white px-3 text-[12px] placeholder:text-[#aaa39a]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] text-[#514a42]">Password</label>
              <Input
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-9 rounded-[3px] border-[#d9d4cb] bg-white px-3 text-[12px] placeholder:text-[#aaa39a]"
              />
            </div>
          </div>

          {error && <p className="text-sm text-[#d45d5d]">{error}</p>}
          <Button
            type="submit"
            className="mt-2 h-10 w-full rounded-[3px] border-[#9d7b42] bg-[#9d7b42] text-[12px] font-medium text-white hover:border-[#876733] hover:bg-[#876733]"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
