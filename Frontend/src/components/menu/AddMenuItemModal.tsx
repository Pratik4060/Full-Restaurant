import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAppDispatch } from "../../app/hooks";
import { createMenuItemThunk, updateMenuItemThunk } from "../../features/menu/menuSlice";
import type { DietType, MealType, MenuItem } from "../../types/api";
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

const createFormFromItem = (item: MenuItem) => ({
  name: item.name,
  description: item.description,
  imageUrl: item.imageUrl ?? "",
  price: item.price,
  prepTimeMins: item.prepTimeMins,
  type: item.type,
  category: item.category,
  subCategory: item.subCategory ?? "",
  diet: item.diet,
  isBestseller: item.isBestseller,
  isAvailable: item.isAvailable,
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected image"));
    reader.readAsDataURL(file);
  });

const compressImage = async (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.8) => {
  const dataUrl = await readFileAsDataUrl(file);
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to process the selected image"));
    image.src = dataUrl;
  });

  const scale = Math.min(1, maxWidth / img.width, maxHeight / img.height);
  if (scale >= 1) return dataUrl;

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));

  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
};

export function AddMenuItemModal({
  open,
  onClose,
  initialItem,
}: {
  open: boolean;
  onClose: () => void;
  initialItem?: MenuItem | null;
}) {
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState(createEmptyForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditing = Boolean(initialItem);

  useEffect(() => {
    if (!open) return;
    setForm(initialItem ? createFormFromItem(initialItem) : createEmptyForm());
    setSubmitError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialItem, open]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.imageUrl.trim()) {
      setSubmitError("Image is required");
      return;
    }

    const payload = {
      ...form,
      imageUrl: form.imageUrl.trim(),
      subCategory: form.subCategory || undefined,
    };

    if (initialItem) {
      await dispatch(
        updateMenuItemThunk({
          id: initialItem.id,
          data: payload,
        })
      );
    } else {
      await dispatch(createMenuItemThunk(payload));
    }

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
      const dataUrl = await compressImage(file);
      setForm((current) => ({ ...current, imageUrl: dataUrl }));
    } catch {
      setForm((current) => ({ ...current, imageUrl: "" }));
    }
  };

  const categoryOptions = mealCategoryOptions[form.type];

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Edit Menu Item" : "Add Menu Item"}>
      <form onSubmit={submit} className="w-full max-w-[calc(100vw-56px)]">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] text-[#6b665f]">Name</label>
            <Input
              placeholder="Enter Menu Item Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px] placeholder:text-[#beb6ac]"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] text-[#6b665f]">Description</label>
            <textarea
              placeholder="e.g T-1"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="min-h-[70px] w-full rounded-[6px] border border-[#ded9d1] bg-[#fafafa] px-3 py-2 text-[12px] text-[#1f1f1f] outline-none transition placeholder:text-[#beb6ac] focus:border-brand-400 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] text-[#6b665f]">Upload image *</label>
            {submitError ? <p className="mb-1 text-[11px] text-[#d65c5c]">{submitError}</p> : null}
            <div className="flex h-[92px] items-center justify-center rounded-[6px] border border-dashed border-[#e3cfa8] bg-white text-[#8f867d]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => void handleImageChange(event)}
                className="hidden"
              />
              <button
                type="button"
                className="flex items-center gap-3 text-[13px] text-[#7f7568]"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#b7b0a6] text-[22px] leading-none">
                  +
                </span>
                add
              </button>
            </div>
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt="Selected menu item"
                className="mt-2 h-24 w-full rounded-[6px] border border-[#eadfce] object-cover"
              />
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">Price</label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">Prep Time (mins)</label>
              <Input
                type="number"
                value={form.prepTimeMins}
                onChange={(e) => setForm({ ...form, prepTimeMins: Number(e.target.value) })}
                className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">Type</label>
              <Select
                value={form.type}
                onChange={(e) => handleTypeChange(e.target.value as MealType)}
                className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
              >
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">Category</label>
              <Select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => setForm({ ...form, diet: "VEG" })}
              className="inline-flex items-center gap-2 text-[13px] text-[#1f1f1f]"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border"
                style={{ borderColor: form.diet === "VEG" ? "#35b935" : "#b7b0a6" }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: form.diet === "VEG" ? "#35b935" : "transparent" }}
                />
              </span>
              Veg
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, diet: "NON_VEG" })}
              className="inline-flex items-center gap-2 text-[13px] text-[#1f1f1f]"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border"
                style={{ borderColor: form.diet === "NON_VEG" ? "#35b935" : "#b7b0a6" }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: form.diet === "NON_VEG" ? "#35b935" : "transparent" }}
                />
              </span>
              Non Veg
            </button>
          </div>

          <label className="flex items-center gap-2 pt-1 text-[11px] text-[#6f685f]">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="h-4 w-4 accent-[#d2a55f]"
            />
            Available for ordering
          </label>

          <div className="grid gap-4 pt-2 md:grid-cols-2">
            <Button
              type="button"
              variant="secondary"
              className="h-10 rounded-[6px] border-[#efc98f] bg-white text-[13px] font-medium text-[#c79d67] hover:bg-[#fffaf2]"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-[6px] border-[#9a742f] bg-[#9a742f] text-[13px] font-medium text-white hover:border-[#866426] hover:bg-[#866426]"
            >
              {isEditing ? "Save" : "Create"}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
