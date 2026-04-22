import React from 'react';
import  type { BreakfastTab } from './Breakfast/Data';

interface Props {
  activeTab: BreakfastTab;
  onTabChange: (tab: BreakfastTab) => void;
}

const CategoryTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  const tabs: BreakfastTab[] = ['All', 'Bestseller', 'Beverages', 'Health', 'Quick Bites'];

  return (
    <div className="px-5">
      <div className="montserrat bg-[#FFF4DF] px-4 py-2 flex gap-13 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`text-[16px] whitespace-nowrap transition-all pb-1 ${
              activeTab === tab
                ? 'font-semibold border-b-2 border-black text-black'
                : 'text-gray-500'
            }`}
          >
            {tab}
          </button>


        ))}

        
      </div>
    </div>
  );
};

export default CategoryTabs;
