import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { PageHeader } from "../components/layout/PageHeader";
import { AddMenuItemModal } from "../components/menu/AddMenuItemModal";
import { MenuItemCard } from "../components/menu/MenuItemCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import {
  fetchMenuItemsThunk,
  setCategoryFilter,
  setDietFilter,
  setMealTypeFilter,
  setMenuSearch,
} from "../features/menu/menuSlice";

export function MenuItemsPage() {
  const dispatch = useAppDispatch();
  const { list, search, dietFilter, mealTypeFilter, categoryFilter } = useAppSelector((s) => s.menu);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchMenuItemsThunk(undefined));
  }, [dispatch]);

  const categories = useMemo(() => [...new Set(list.map((i) => i.category))], [list]);

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
        action={<Button onClick={() => setOpen(true)}>+ Add Item</Button>}
      />

      <div className="grid gap-3 rounded-2xl border border-[#e6ddd0] bg-white p-4 shadow-[0_8px_22px_rgba(44,33,18,0.05)] md:grid-cols-4">
        <Input value={search} onChange={(e) => dispatch(setMenuSearch(e.target.value))} placeholder="Search by name" />
        <Select value={dietFilter} onChange={(e) => dispatch(setDietFilter(e.target.value as "ALL" | "VEG" | "NON_VEG" | "BEVERAGE"))}>
          <option value="ALL">All Diet</option>
          <option value="VEG">Veg</option>
          <option value="NON_VEG">Non Veg</option>
          <option value="BEVERAGE">Beverage</option>
        </Select>
        <Select value={mealTypeFilter} onChange={(e) => dispatch(setMealTypeFilter(e.target.value as "ALL" | "BREAKFAST" | "LUNCH" | "DINNER"))}>
          <option value="ALL">All Type</option>
          <option value="BREAKFAST">Breakfast</option>
          <option value="LUNCH">Lunch</option>
          <option value="DINNER">Dinner</option>
        </Select>
        <Select value={categoryFilter} onChange={(e) => dispatch(setCategoryFilter(e.target.value))}>
          <option value="ALL">All Categories</option>
          {categories.map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>

      <AddMenuItemModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
