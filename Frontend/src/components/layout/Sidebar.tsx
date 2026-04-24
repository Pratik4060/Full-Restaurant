import { NavLink } from "react-router-dom";

const primaryLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "/assets/Sidebar/Dashboard.svg" },
  { to: "/orders", label: "Orders", icon: "/assets/Sidebar/Orders.svg" },
  { to: "/menu-items", label: "Menu Items", icon: "/assets/Sidebar/Menu.svg" },
  { to: "/offers", label: "Offers", icon: "/assets/Sidebar/Offers.svg" },
  { to: "/customers", label: "Customers", icon: "/assets/Sidebar/Customers.svg" },
  { to: "/billing", label: "Billing", icon: "/assets/Sidebar/Budget.svg" },
  { to: "/users", label: "Users", icon: "/assets/Sidebar/Users.svg" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-[200px] shrink-0 border-r border-[#d8d1c7] bg-white lg:block">
      <nav className="px-4 pt-6 pb-4">
        {primaryLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `mb-3 flex items-center gap-3 rounded-[6px] px-4 py-4 text-[14px] font-medium transition ${
                isActive ? "bg-[#efce98] text-[#121212]" : "text-[#2d2a26] hover:bg-[#faf4eb]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <img src={link.icon} alt="" aria-hidden="true" className={`h-5 w-5 shrink-0 ${isActive ? "opacity-100" : "opacity-85"}`} />
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
