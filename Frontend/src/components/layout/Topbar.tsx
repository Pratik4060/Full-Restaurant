import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";

export function Topbar() {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.auth.admin);
  const initials = admin?.name?.charAt(0).toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-10 border-b border-[#d8d1c7] bg-white px-5 py-3 shadow-[0_2px_3px_rgba(0,0,0,0.08)] md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img src="/assets/logo.svg" alt="Restaurant logo" className="h-[48px] w-[48px] shrink-0 rounded-[8px] object-cover" />
          <div className="leading-tight">
            <p className="text-[12px] font-medium text-[#111111]">Restaurant</p>
            <p className="text-[12px] text-[#111111]">Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <button type="button" className="text-[#24345a]" aria-label="Notifications">
            <img src="/assets/bell.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          </button>

          <div className="text-right leading-4">
            <p className="text-[12px] font-medium text-[#111111]">{admin?.name ?? "Admin User"}</p>
            <p className="text-[11px] text-[#111111]">{admin?.email ?? "Admin"}</p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ad8746] text-[12px] font-medium text-white">
            {initials}
          </div>

          <button
            onClick={() => dispatch(logout())}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#ff5a5a] transition hover:bg-[#fff5f5]"
            aria-label="Logout"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 3v18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
