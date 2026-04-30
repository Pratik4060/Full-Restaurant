// components/Breakfast/BreakfastList.tsx
import React, { useMemo } from 'react';
import { type BeverageTab, type HealthTab, type BreakfastTab, type BreakfastItem } from './Data';
import MenuCard from '../MenuCard';
import type {FoodType} from "../../types"
interface Props {
  activeTab: BreakfastTab;
  activeBeverageTab: BeverageTab;
  activeHealthTab: HealthTab;
  foodType: FoodType;
  items?: BreakfastItem[];
  searchQuery?: string;
  onItemClick?: (item: BreakfastItem) => void;
}

const MenuList: React.FC<Props> = ({ 
  activeTab, 
  activeBeverageTab, 
  activeHealthTab,
  foodType,
  items = [],
  searchQuery = "",
  onItemClick
}) => {
const normalizedQuery = searchQuery.trim().toLowerCase();

const filteredItems = useMemo(() => {
  const baseItems = items.map((item) => ({ ...item, mealType: item.mealType ?? "Breakfast" })).filter((item) => {
    if (item.category === "Beverages") return true;
    if (item.category === "Health") return true;
    if (item.foodType) return item.foodType === foodType;
    return foodType === "Veg";
  });

  const searchFilteredItems = normalizedQuery
    ? baseItems.filter((item) => {
        const haystack = `${item.name} ${item.description}`.toLowerCase();
        return haystack.includes(normalizedQuery);
      })
    : baseItems;

  if (activeTab === "All") {
    return searchFilteredItems;
  }

  if (activeTab === "Bestseller") {
    return searchFilteredItems.filter((item) => item.isBestseller);
  }

  if (activeTab === "Beverages") {
    const beverageItems = searchFilteredItems.filter(
      (item) => item.category === "Beverages",
    );

    if (activeBeverageTab === "All") {
      return beverageItems;
    }

    return beverageItems.filter(
      (item) => item.subCategory === activeBeverageTab,
    );
  }

  if (activeTab === "Health") {
    const healthItems = searchFilteredItems.filter((item) => item.category === "Health");
    return healthItems.filter((item) => item.subCategory === activeHealthTab);
  }

  return searchFilteredItems.filter((item) => item.category === activeTab);
}, [activeTab, activeBeverageTab, activeHealthTab, foodType, items, normalizedQuery]);

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">
          {normalizedQuery ? "No items match your search" : "No items found in this category"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredItems.map((item) => (
        <MenuCard
          key={item.id}
          item={item}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
};

export default MenuList;
