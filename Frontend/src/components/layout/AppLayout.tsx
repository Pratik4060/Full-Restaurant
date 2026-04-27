import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { LoadingOverlay } from "../ui/LoadingOverlay";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isBusy = useAppSelector(
    (state) =>
      state.auth.loading ||
      state.dashboard.loading ||
      state.customers.loading ||
      state.customers.deleting ||
      state.billing.loading ||
      state.billing.mutating ||
      state.users.loading ||
      state.users.mutating ||
      state.orders.loading ||
      state.menu.loading ||
      state.menu.mutating ||
      state.offers.loading ||
      state.offers.mutating
  );

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col bg-[#F2F2F2]">
        <Topbar onMenuOpen={() => setMobileSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
          <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 md:px-5 lg:pl-7 xl:px-6">
            <div className="mx-auto min-w-0 w-full max-w-[1120px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {isBusy ? <LoadingOverlay /> : null}
    </div>
  );
}
