import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col bg-[#F2F2F2]">
        <Topbar />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 px-4 py-4 md:px-5 xl:px-6">
            <div className="mx-auto w-full max-w-[1120px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
