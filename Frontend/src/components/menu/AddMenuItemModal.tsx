import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAppDispatch } from "../../app/hooks";
import { createMenuItemThunk } from "../../features/menu/menuSlice";
import type { DietType, MealType } from "../../types/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

const mealCategoryOptions: Record<MealType, string[]> = {
  BREAKFAST: ["All", "Beverages", "Health", "Quick Bites"],
  LUNCH: ["Main Course", "Appetizer", "Roti", "Starters", "Rice", "Dessert"],
  DINNER: ["Main Course", "Appetizer", "Roti", "Starters", "Rice", "Dessert"],
};

const subCategoryOptions: Record<string, string[]> = {
  Beverages: ["Fresh Juice", "Mocktails", "Cocktails", "Spirits", "Beer", "Wine", "Hot Beverages"],
  Health: ["Veg", "Non Veg"],
};

const createEmptyForm = () => ({
  name: "",
  description: "",
  imageUrl: "",
  price: 1,
  prepTimeMins: 10,
  type: "BREAKFAST" as MealType,
  category: "All",
  subCategory: "",
  diet: "VEG" as DietType,
  isBestseller: false,
  isAvailable: true,
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected image"));
    reader.readAsDataURL(file);
  });

export function AddMenuItemModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState(createEmptyForm);

  useEffect(() => {
    if (!open) return;
    setForm(createEmptyForm());
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [open]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await dispatch(
      createMenuItemThunk({
        ...form,
        imageUrl: form.imageUrl || undefined,
        subCategory: form.subCategory || undefined,
      })
    );
    onClose();
  };

  const handleTypeChange = (type: MealType) => {
    const nextCategories = mealCategoryOptions[type];
    setForm((current) => ({
      ...current,
      type,
      category: nextCategories.includes(current.category) ? current.category : nextCategories[0],
      subCategory: (() => {
        const nextCategory = nextCategories.includes(current.category) ? current.category : nextCategories[0];
        return subCategoryOptions[nextCategory]?.includes(current.subCategory) ? current.subCategory : "";
      })(),
    }));
  };

  const handleCategoryChange = (category: string) => {
    const nextSubCategories = subCategoryOptions[category] ?? [];
    setForm((current) => ({
      ...current,
      category,
      subCategory: nextSubCategories.includes(current.subCategory) ? current.subCategory : "",
    }));
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setForm((current) => ({ ...current, imageUrl: dataUrl }));
    } catch {
      setForm((current) => ({ ...current, imageUrl: "" }));
    }
  };

  const categoryOptions = mealCategoryOptions[form.type];
  const activeSubCategories = subCategoryOptions[form.category] ?? [];

  return (
    <Modal open={open} onClose={onClose} title="Add Menu Item">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] text-[#706a63]">Name</label>
          <Input placeholder="Enter Menu Item Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#706a63]">Description</label>
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#706a63]">Image</label>
          <div className="space-y-2 rounded-md border border-dashed border-[#d9ccb8] bg-[#fcfaf6] p-3">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(event) => void handleImageChange(event)}
              className="h-auto bg-white px-2 py-1.5"
            />
            <Input
              placeholder="Paste image URL if you have one"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt="Selected menu item"
                className="h-32 w-full rounded-md border border-[#eadfce] object-cover"
              />
            ) : null}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-[#706a63]">Price</label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#706a63]">Prep Time (mins)</label>
            <Input type="number" value={form.prepTimeMins} onChange={(e) => setForm({ ...form, prepTimeMins: Number(e.target.value) })} required />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <Select value={form.type} onChange={(e) => handleTypeChange(e.target.value as MealType)}>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
          </Select>
          <Select value={form.category} onChange={(e) => handleCategoryChange(e.target.value)}>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
          <Select value={form.diet} onChange={(e) => setForm({ ...form, diet: e.target.value as DietType })}>
            <option value="VEG">Veg</option>
            <option value="NON_VEG">Non Veg</option>
            <option value="BEVERAGE">Beverage</option>
          </Select>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            value={form.subCategory}
            onChange={(e) => setForm({ ...form, subCategory: e.target.value })}
            disabled={activeSubCategories.length === 0}
          >
            <option value="">{activeSubCategories.length === 0 ? "No subcategory" : "Select subcategory"}</option>
            {activeSubCategories.map((subCategory) => (
              <option key={subCategory} value={subCategory}>
                {subCategory}
              </option>
            ))}
          </Select>
          <label className="flex items-center gap-2 rounded-md border border-[#eadfce] px-3 py-2 text-[12px] text-[#5f5a53]">
            <input
              type="checkbox"
              checked={form.isBestseller}
              onChange={(e) => setForm({ ...form, isBestseller: e.target.checked })}
            />
            Mark as bestseller
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" className="min-w-28" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="min-w-32">Create</Button>
        </div>
      </form>
    </Modal>
  );
}
