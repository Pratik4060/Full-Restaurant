import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { PageHeader } from "../components/layout/PageHeader";
import { AddMenuItemModal } from "../components/menu/AddMenuItemModal";
import { MenuItemCard } from "../components/menu/MenuItemCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import plus from "../../public/assets/plus.svg"
import {
  fetchMenuItemsThunk,
  setCategoryFilter,
  setDietFilter,
  setMealTypeFilter,
  setMenuSearch,
} from "../features/menu/menuSlice";
import type { MenuItem } from "../types/api";

const frontendBreakfastCategories = ["Bestseller", "Beverages", "Health", "Quick Bites"];
const frontendLunchDinnerCategories = [
  "Main Course",
  "Appetizer",
  "Roti",
  "Starters",
  "Rice",
  "Bestseller",
  "Beverages",
  "Dessert",
];

const uniqueSorted = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

export function MenuItemsPage() {
  const dispatch = useAppDispatch();
  const { list, search, dietFilter, mealTypeFilter, categoryFilter } = useAppSelector((s) => s.menu);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    void dispatch(fetchMenuItemsThunk(undefined));
  }, [dispatch]);

  const allCategories = useMemo(
    () =>
      uniqueSorted([
        ...list.map((item) => item.category),
        ...frontendBreakfastCategories,
        ...frontendLunchDinnerCategories,
      ]),
    [list]
  );
  const categoriesByType = useMemo(() => {
    const grouped = {
      ALL: allCategories,
      BREAKFAST: frontendBreakfastCategories,
      LUNCH: frontendLunchDinnerCategories,
      DINNER: frontendLunchDinnerCategories,
    };

    return grouped;
  }, [allCategories]);

  const visibleCategories = categoriesByType[mealTypeFilter];

  useEffect(() => {
    if (categoryFilter !== "ALL" && !visibleCategories.includes(categoryFilter)) {
      dispatch(setCategoryFilter("ALL"));
    }
  }, [categoryFilter, dispatch, visibleCategories]);

  const filtered = useMemo(() => {
    return list.filter((i) => {
      const s = i.name.toLowerCase().includes(search.toLowerCase());
      const d = dietFilter === "ALL" || i.diet === dietFilter;
      const t = mealTypeFilter === "ALL" || i.type === mealTypeFilter;
      const c = categoryFilter === "ALL" || i.category === categoryFilter;
      return s && d && t && c;
    });
  }, [list, search, dietFilter, mealTypeFilter, categoryFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Menu Items"
        subtitle="Manage your restaurant menu"
        action={
          <Button
            onClick={() => {
              setEditingItem(null);
              setOpen(true);
            }}
          >
            <span className="flex gap-2 ">
            <img src={plus} alt="plus"/>
             Add Item

            </span>
          </Button>
        }
      />

      <div className="rounded-[18px] border border-[#e6ddd0] bg-white p-8 shadow-[0_8px_22px_rgba(44,33,18,0.05)]">
        <div className="grid gap-3 md:grid-cols-[1.25fr_auto_auto_0.92fr_0.92fr] md:items-center">
          <label className="flex h-11 items-center rounded-[8px] border border-[#dcd6ce] bg-[#f5f5f5] px-3 transition focus-within:border-[#c9c0b5] focus-within:bg-white">
            <svg
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4 shrink-0 text-[#9f968b]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <Input
              value={search}
              onChange={(e) => dispatch(setMenuSearch(e.target.value))}
              placeholder="Search by name"
              className="h-full border-0 bg-transparent px-0 text-[13px] placeholder:text-[#b2aba1] focus:border-0 focus:bg-transparent"
            />
          </label>

          <button
            type="button"
            onClick={() => dispatch(setDietFilter(dietFilter === "VEG" ? "ALL" : "VEG"))}
            className="inline-flex items-center gap-3 text-[15px] text-[#1f1f1f]"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border"
              style={{ borderColor: dietFilter === "VEG" ? "#35b935" : "#b9b2aa" }}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: dietFilter === "VEG" ? "#35b935" : "transparent" }}
              />
            </span>
            <span>Veg</span>
          </button>

          <button
            type="button"
            onClick={() => dispatch(setDietFilter(dietFilter === "NON_VEG" ? "ALL" : "NON_VEG"))}
            className="inline-flex items-center gap-3 text-[15px] text-[#1f1f1f]"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full border"
              style={{ borderColor: dietFilter === "NON_VEG" ? "#35b935" : "#b9b2aa" }}
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: dietFilter === "NON_VEG" ? "#35b935" : "transparent" }}
              />
            </span>
            <span>Non Veg</span>
          </button>

          <Select
            value={mealTypeFilter}
            onChange={(e) => dispatch(setMealTypeFilter(e.target.value as "ALL" | "BREAKFAST" | "LUNCH" | "DINNER"))}
            className={`h-11 rounded-[8px] border-[#d9c79d] px-4 text-[13px] ${
              mealTypeFilter === "BREAKFAST"
                ? "bg-[#f2cc8b] text-[#1f1f1f]"
                : "bg-[#f5f5f5]"
            }`}
          >
            <option value="ALL">All Type</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </Select>

          <Select
            value={categoryFilter}
            onChange={(e) => dispatch(setCategoryFilter(e.target.value))}
            className="h-11 rounded-[8px] border-[#dcd6ce] bg-[#f5f5f5] px-4 text-[13px]"
          >
            <option value="ALL">All Categories</option>
            {visibleCategories.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid justify-items-center gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <div key={item.id} className="w-full max-w-[310px]">
            <MenuItemCard
              item={item}
              onEdit={(selectedItem) => {
                setEditingItem(selectedItem);
                setOpen(false);
              }}
            />
          </div>
        ))}
      </div>

      <AddMenuItemModal
        open={open || Boolean(editingItem)}
        initialItem={editingItem}
        onClose={() => {
          setOpen(false);
          setEditingItem(null);
        }}
      />
    </div>
  );
}
