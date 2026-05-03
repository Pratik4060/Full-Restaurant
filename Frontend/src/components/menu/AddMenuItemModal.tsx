import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useAppDispatch } from "../../app/hooks";
import {
  createMenuItemThunk,
  updateMenuItemThunk,
} from "../../features/menu/menuSlice";
import type { DietType, MealType, MenuItem } from "../../types/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

const mealCategoryOptions: Record<MealType, string[]> = {
  BREAKFAST: ["All", "Beverages", "Health", "Quick Bites"],
  LUNCH: ["Main Course", "Appetizer", "Roti", "Rice", "Dessert", "Beverages"],
  DINNER: ["Main Course", "Appetizer", "Roti", "Rice", "Dessert", "Beverages"],
};

const subCategoryOptions: Record<string, string[]> = {
  Beverages: [
    "Fresh Juice",
    "Mocktails",
    "Cocktails",
    "Spirits",
    "Beer",
    "Wine",
    "Hot Beverages",
  ],
  Health: ["Veg", "Non Veg"],
};

type MenuItemFormState = {
  name: string;
  description: string;
  price: string;
  prepTimeMins: string;
  type: MealType | "";
  category: string;
  subCategory: string;
  diet: DietType | "";
  isBestseller: boolean;
  isAvailable: boolean;
};

type MenuItemFormErrors = Partial<
  Record<
    | "name"
    | "description"
    | "image"
    | "price"
    | "prepTimeMins"
    | "type"
    | "category"
    | "subCategory",
    string
  >
>;

const createEmptyForm = (): MenuItemFormState => ({
  name: "",
  description: "",
  price: "",
  prepTimeMins: "",
  type: "",
  category: "",
  subCategory: "",
  diet: "VEG",
  isBestseller: false,
  isAvailable: true,
});

const createFormFromItem = (item: MenuItem): MenuItemFormState => ({
  name: item.name,
  description: item.description,
  price: String(item.price),
  prepTimeMins: String(item.prepTimeMins),
  type: item.type,
  category: item.category,
  subCategory: item.subCategory ?? "",
  diet: item.diet,
  isBestseller: item.isBestseller,
  isAvailable: item.isAvailable,
});

const renderFieldError = (message?: string) =>
  message ? <p className="mt-1 text-[11px] text-[#d65c5c]">{message}</p> : null;

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
  const [form, setForm] = useState<MenuItemFormState>(createEmptyForm());
  const [formErrors, setFormErrors] = useState<MenuItemFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const isEditing = Boolean(initialItem);

  useEffect(() => {
    if (!open) return;

    const nextForm = initialItem
      ? createFormFromItem(initialItem)
      : createEmptyForm();
    setForm(nextForm);
    setFormErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
    setImageFile(null);
    setImagePreviewUrl(initialItem?.imageUrl ?? "");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [initialItem, open]);

  useEffect(() => {
    return () => {
      if (imagePreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const categoryOptions = form.type ? mealCategoryOptions[form.type] : [];
  const subCategories = form.category
    ? (subCategoryOptions[form.category] ?? [])
    : [];

  const validateForm = (current: MenuItemFormState) => {
    const nextErrors: MenuItemFormErrors = {};

    if (!current.name.trim()) nextErrors.name = "Name is required";
    else if (current.name.trim().length < 2)
      nextErrors.name = "Name must be at least 2 characters";

    if (!current.description.trim())
      nextErrors.description = "Description is required";
    else if (current.description.trim().length < 2)
      nextErrors.description = "Description must be at least 2 characters";

    if (!imagePreviewUrl && !imageFile) nextErrors.image = "Image is required";

    const priceValue = Number(current.price);
    if (!current.price.trim()) nextErrors.price = "Price is required";
    else if (!Number.isFinite(priceValue) || priceValue <= 0)
      nextErrors.price = "Price must be greater than 0";

    const prepTimeValue = Number(current.prepTimeMins);
    if (!current.prepTimeMins.trim())
      nextErrors.prepTimeMins = "Prep time is required";
    else if (!Number.isInteger(prepTimeValue) || prepTimeValue <= 0) {
      nextErrors.prepTimeMins =
        "Prep time must be a whole number greater than 0";
    }

    if (!current.type) nextErrors.type = "Type is required";
    if (!current.category) nextErrors.category = "Category is required";
    if (
      subCategoryOptions[current.category]?.length &&
      !current.subCategory.trim()
    ) {
      nextErrors.subCategory = "Subcategory is required";
    }

    return nextErrors;
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const nextErrors = validateForm(form);
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      prepTimeMins: Number(form.prepTimeMins),
      type: form.type as MealType,
      category: form.category.trim(),
      subCategory: form.subCategory.trim()
        ? form.subCategory.trim()
        : undefined,
      diet: form.diet as DietType,
      isBestseller: form.isBestseller,
      isAvailable: form.isAvailable,
      image: imageFile,
    };

    setIsSubmitting(true);
    try {
      if (initialItem) {
        await dispatch(
          updateMenuItemThunk({
            id: initialItem.id,
            data: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createMenuItemThunk(payload)).unwrap();
      }
      onClose();
    } catch (error) {
      setSubmitError((error as Error).message || "Unable to save menu item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: MealType | "") => {
    const nextCategories = type ? mealCategoryOptions[type] : [];
    setForm((current) => ({
      ...current,
      type,
      category: nextCategories.includes(current.category)
        ? current.category
        : "",
      subCategory: (() => {
        const nextCategory = nextCategories.includes(current.category)
          ? current.category
          : "";
        return subCategoryOptions[nextCategory]?.includes(current.subCategory)
          ? current.subCategory
          : "";
      })(),
    }));
    setFormErrors((current) => ({
      ...current,
      type: undefined,
      category: undefined,
      subCategory: undefined,
    }));
  };

  const handleCategoryChange = (category: string) => {
    const nextSubCategories = subCategoryOptions[category] ?? [];
    setForm((current) => ({
      ...current,
      category,
      subCategory: nextSubCategories.includes(current.subCategory)
        ? current.subCategory
        : "",
    }));
    setFormErrors((current) => ({
      ...current,
      category: undefined,
      subCategory: undefined,
    }));
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (imagePreviewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setFormErrors((current) => ({ ...current, image: undefined }));
    setSubmitError(null);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Menu Item" : "Add Menu Item"}
    >
      <form
        onSubmit={submit}
        noValidate
        className="w-full max-w-[calc(100vw-56px)]"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] text-[#6b665f]">
              Name
            </label>
            <Input
              placeholder="Enter Menu Item Name"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setFormErrors((current) => ({ ...current, name: undefined }));
              }}
              aria-invalid={Boolean(formErrors.name)}
              className={`h-10 rounded-[6px] px-3 text-[12px] placeholder:text-[#beb6ac] ${
                formErrors.name
                  ? "border-[#de6b6b] bg-[#fff7f7]"
                  : "border-[#ded9d1] bg-[#fafafa]"
              }`}
            />
            {renderFieldError(formErrors.name)}
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] text-[#6b665f]">
              Description
            </label>
            <textarea
              placeholder="e.g T-1"
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                setFormErrors((current) => ({
                  ...current,
                  description: undefined,
                }));
              }}
              aria-invalid={Boolean(formErrors.description)}
              className={`min-h-[70px] w-full rounded-[6px] border px-3 py-2 text-[12px] text-[#1f1f1f] outline-none transition placeholder:text-[#beb6ac] focus:border-brand-400 focus:bg-white ${
                formErrors.description
                  ? "border-[#de6b6b] bg-[#fff7f7]"
                  : "border-[#ded9d1] bg-[#fafafa]"
              }`}
            />
            {renderFieldError(formErrors.description)}
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] text-[#6b665f]">
              Upload image *
            </label>
            {renderFieldError(formErrors.image)}
            <div
              className={`flex h-[120px] items-center justify-center overflow-hidden rounded-[6px] border border-dashed text-[#8f867d] ${
                formErrors.image
                  ? "border-[#de6b6b] bg-[#fff7f7]"
                  : "border-[#e3cfa8] bg-white"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreviewUrl ? (
                <button
                  type="button"
                  className="flex h-full w-full items-center justify-center p-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    src={imagePreviewUrl}
                    alt="Selected menu item"
                    className="h-full w-full rounded-[4px] object-contain"
                  />
                </button>
              ) : (
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
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">
                Price
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: e.target.value });
                  setFormErrors((current) => ({
                    ...current,
                    price: undefined,
                  }));
                }}
                aria-invalid={Boolean(formErrors.price)}
                className={`h-10 rounded-[6px] px-3 text-[12px] ${
                  formErrors.price
                    ? "border-[#de6b6b] bg-[#fff7f7]"
                    : "border-[#ded9d1] bg-[#fafafa]"
                }`}
              />
              {renderFieldError(formErrors.price)}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">
                Prep Time (mins)
              </label>
              <Input
                type="number"
                min="1"
                step="1"
                value={form.prepTimeMins}
                onChange={(e) => {
                  setForm({ ...form, prepTimeMins: e.target.value });
                  setFormErrors((current) => ({
                    ...current,
                    prepTimeMins: undefined,
                  }));
                }}
                aria-invalid={Boolean(formErrors.prepTimeMins)}
                className={`h-10 rounded-[6px] px-3 text-[12px] ${
                  formErrors.prepTimeMins
                    ? "border-[#de6b6b] bg-[#fff7f7]"
                    : "border-[#ded9d1] bg-[#fafafa]"
                }`}
              />
              {renderFieldError(formErrors.prepTimeMins)}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">
                Type
              </label>
              <Select
                value={form.type}
                onChange={(e) => {
                  handleTypeChange(e.target.value as MealType);
                  setFormErrors((current) => ({ ...current, type: undefined }));
                }}
                aria-invalid={Boolean(formErrors.type)}
                className={`h-10 rounded-[6px] px-3 text-[12px] ${
                  formErrors.type
                    ? "border-[#de6b6b] bg-[#fff7f7]"
                    : "border-[#ded9d1] bg-[#fafafa]"
                }`}
              >
                <option value="">Select Type</option>
                <option value="BREAKFAST">Breakfast</option>
                <option value="LUNCH">Lunch</option>
                <option value="DINNER">Dinner</option>
              </Select>
              {renderFieldError(formErrors.type)}
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">
                Category
              </label>
              <Select
                value={form.category}
                onChange={(e) => {
                  handleCategoryChange(e.target.value);
                  setFormErrors((current) => ({
                    ...current,
                    category: undefined,
                  }));
                }}
                aria-invalid={Boolean(formErrors.category)}
                className={`h-10 rounded-[6px] px-3 text-[12px] ${
                  formErrors.category
                    ? "border-[#de6b6b] bg-[#fff7f7]"
                    : "border-[#ded9d1] bg-[#fafafa]"
                }`}
                disabled={!form.type}
              >
                <option value="">Select Category</option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
              {renderFieldError(formErrors.category)}
            </div>
          </div>

          {subCategories.length > 0 ? (
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">
                Subcategory
              </label>
              <Select
                value={form.subCategory}
                onChange={(e) => {
                  setForm({ ...form, subCategory: e.target.value });
                  setFormErrors((current) => ({
                    ...current,
                    subCategory: undefined,
                  }));
                }}
                aria-invalid={Boolean(formErrors.subCategory)}
                className={`h-10 rounded-[6px] px-3 text-[12px] ${
                  formErrors.subCategory
                    ? "border-[#de6b6b] bg-[#fff7f7]"
                    : "border-[#ded9d1] bg-[#fafafa]"
                }`}
              >
                <option value="">Select Subcategory</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory} value={subCategory}>
                    {subCategory}
                  </option>
                ))}
              </Select>
              {renderFieldError(formErrors.subCategory)}
            </div>
          ) : null}

          <div className="flex items-center gap-4 pt-1">
            <button
              type="button"
              onClick={() => setForm({ ...form, diet: "VEG" })}
              className="inline-flex items-center gap-2 text-[13px] text-[#1f1f1f]"
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full border"
                style={{
                  borderColor: form.diet === "VEG" ? "#35b935" : "#b7b0a6",
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      form.diet === "VEG" ? "#35b935" : "transparent",
                  }}
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
                style={{
                  borderColor: form.diet === "NON_VEG" ? "#35b935" : "#b7b0a6",
                }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      form.diet === "NON_VEG" ? "#35b935" : "transparent",
                  }}
                />
              </span>
              Non Veg
            </button>
          </div>

          <label className="flex items-center gap-2 pt-1 text-[11px] text-[#6f685f]">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) =>
                setForm({ ...form, isAvailable: e.target.checked })
              }
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
              disabled={isSubmitting}
              className="h-10 rounded-[6px] border-[#9a742f] bg-[#9a742f] text-[13px] font-medium text-white hover:border-[#866426] hover:bg-[#866426]"
            >
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save"
                  : "Create"}
            </Button>
          </div>
          {submitError ? (
            <p className="text-[11px] text-[#d65c5c]">{submitError}</p>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
