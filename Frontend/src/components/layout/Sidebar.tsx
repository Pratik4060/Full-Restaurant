import { NavLink } from "react-router-dom";

const primaryLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/orders", label: "Orders" },
  { to: "/menu-items", label: "Menu Items" },
  { to: "/offers", label: "Offers" },
  { to: "/customers", label: "Customers" },
  { to: "/billing", label: "Billing" },
  { to: "/users", label: "Users" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-[210px] border-r border-[#e4ddd3] bg-white lg:block">
      <div className="border-b border-[#efe7db] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-[10px] font-semibold text-white">
            RM
          </div>
          <div>
            <p className="text-[10px] font-semibold leading-4 text-[#2b2b2b]">Restaurant</p>
            <p className="text-[10px] leading-4 text-[#6f6a63]">Management System</p>
          </div>
        </div>
      </div>

      <nav className="space-y-1 px-3 py-4">
        {primaryLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2.5 text-[13px] font-medium transition ${
                isActive
                  ? "bg-[#f3d8ac] text-[#5f4826]"
                  : "text-[#44413c] hover:bg-[#faf4eb]"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
