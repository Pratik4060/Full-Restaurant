import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import { clearNotifications, markNotificationsRead } from "../../features/notifications/notificationsSlice";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const formatNotificationTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));

export function Topbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const admin = useAppSelector((state) => state.auth.admin);
  const { orderNotifications, unreadCount } = useAppSelector((state) => state.notifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const initials = admin?.name?.charAt(0).toUpperCase() ?? "A";

  useEffect(() => {
    if (!notificationsOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (notificationsRef.current?.contains(target)) return;
      setNotificationsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [notificationsOpen]);

  const toggleNotifications = () => {
    setNotificationsOpen((current) => !current);
    if (unreadCount > 0) {
      dispatch(markNotificationsRead());
    }
  };

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
          <div ref={notificationsRef} className="relative">
            <button
              type="button"
              onClick={toggleNotifications}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#24345a] transition hover:bg-[#f6f3ef]"
              aria-label="Notifications"
            >
              <img src="/assets/bell.svg" alt="" aria-hidden="true" className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ff4d4d] px-1 text-[10px] font-semibold leading-none text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-11 z-30 w-[320px] overflow-hidden rounded-[10px] border border-[#e1d8cc] bg-white shadow-[0_16px_36px_rgba(24,18,12,0.14)]">
                <div className="flex items-center justify-between border-b border-[#eee6dc] px-4 py-3">
                  <p className="text-[13px] font-semibold text-[#211d18]">New orders</p>
                  {orderNotifications.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => dispatch(clearNotifications())}
                      className="text-[12px] font-medium text-[#ad8746] transition hover:text-[#866426]"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                  {orderNotifications.length > 0 ? (
                    orderNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate("/orders");
                        }}
                        className="block w-full border-b border-[#f0e8de] px-4 py-3 text-left transition last:border-b-0 hover:bg-[#fbf7f1]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-semibold text-[#27221d]">
                              {notification.orderNumber} placed
                            </p>
                            <p className="mt-1 text-[12px] text-[#6d665e]">
                              {notification.customerName} - Table {notification.tableNumber}
                            </p>
                          </div>
                          <p className="shrink-0 text-[11px] text-[#8b8278]">{formatNotificationTime(notification.createdAt)}</p>
                        </div>
                        <p className="mt-2 text-[12px] font-medium text-[#18a34a]">{formatCurrency(notification.totalAmount)}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-[13px] text-[#7e766d]">No new order notifications.</div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

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
