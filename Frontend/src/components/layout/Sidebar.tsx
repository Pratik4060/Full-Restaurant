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

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const navItems = (
    <nav className="px-4 pb-4 pt-6">
      {primaryLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onClose}
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
  );

  return (
    <>
      <aside className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-[200px] shrink-0 overflow-y-auto border-r border-[#d8d1c7] bg-white lg:block">
        {navItems}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={onClose}
            aria-label="Close menu"
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] max-w-[84vw] overflow-y-auto border-r border-[#d8d1c7] bg-white shadow-[0_24px_48px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-[#e6ddd0] px-4 py-4">
              <p className="text-[15px] font-semibold text-[#1f1f1f]">Menu</p>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#e6ddd0] text-[#2d2a26] transition hover:bg-[#faf4eb]"
                aria-label="Close menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
                  <path d="M6 6l12 12" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            </div>
            {navItems}
          </aside>
        </div>
      ) : null}
    </>
  );
}
