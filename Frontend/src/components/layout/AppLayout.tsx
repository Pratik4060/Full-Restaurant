import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#f5f3ef]">
      <div className="mx-auto flex min-h-screen max-w-[1440px] border-x border-[#ded7cd] bg-[#f7f5f1]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar />
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
