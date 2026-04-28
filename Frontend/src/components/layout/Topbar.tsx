import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";

export function Topbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const dispatch = useAppDispatch();
  const admin = useAppSelector((state) => state.auth.admin);
  const initials = admin?.name?.charAt(0).toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-10 border-b border-[#d8d1c7] bg-white px-5 py-3 shadow-[0_2px_3px_rgba(0,0,0,0.08)] md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#e6ddd0] text-[#2d2a26] transition hover:bg-[#faf4eb] lg:hidden"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
          <img src="/assets/logo.svg" alt="Restaurant logo" className="h-[48px] w-[48px] shrink-0 rounded-[8px] object-cover" />
          <div className="hidden leading-tight sm:block">
            <p className="text-[12px] font-medium text-[#111111]">Restaurant</p>
            <p className="text-[12px] text-[#111111]">Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <button type="button" className="text-[#24345a]" aria-label="Notifications">
            <img src="/assets/bell.svg" alt="" aria-hidden="true" className="h-5 w-5" />
          </button>

          <div className="hidden text-right leading-4 sm:block">
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
            <img src="/assets/logout.svg"/>
          </button>
        </div>
      </div>
    </header>
  );
}
