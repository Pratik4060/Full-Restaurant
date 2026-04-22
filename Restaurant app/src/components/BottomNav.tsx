// BottomNav.tsx
import React from 'react';
import menu from "../assets/menu.svg";
import orderfood1 from "../assets/orderfood1.svg";
import track from "../assets/clock.svg";
import bill from "../assets/bill.svg";

interface BottomNavProps {
  activeView: 'menu' | 'orders' | 'track' | 'bill';
  onViewChange: (view: 'menu' | 'orders' | 'track' | 'bill') => void;
}

type NavItem = {
  id: BottomNavProps['activeView'];
  img: string;
  label: string;
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onViewChange }) => {
  const navItems: NavItem[] = [
    { id: 'menu', img: menu, label: 'Menu' },
    { id: 'orders', img: orderfood1, label: 'Orders' },
    { id: 'track', img: track, label: 'Track' },
    { id: 'bill', img: bill, label: 'Bill' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black px-6 py-2.5 flex justify-between items-center">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onViewChange(item.id)}
          className="flex flex-col items-center"
        >
<span>
  <img
    src={item.img}
    alt={item.label}
    className={`w-6 h-6 ${
      activeView === item.id
        ? 'brightness-0 saturate-100 invert-[60%] sepia-[80%] saturate-[500%] hue-rotate-[10deg]'
        : 'grayscale '
    }`}
  />
</span>
          <span className={`text-[9px] mt-0.5 font-bold ${activeView === item.id ? 'text-[#F2D2A5]' : 'text-gray-500'}`}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
