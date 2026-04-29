import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createOfferThunk, fetchOffersThunk, updateOfferThunk } from "../../features/offers/offersSlice";
import type { Offer } from "../../types/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

type OfferFormState = {
  title: string;
  description: string;
  discountType: "PERCENT" | "AMOUNT";
  discountValue: string;
  imageUrl: string;
  validFrom: string;
  validUntil: string;
  minimumOrderAmount: string;
  isActive: boolean;
};

const createEmptyForm = (): OfferFormState => ({
  title: "",
  description: "",
  discountType: "PERCENT",
  discountValue: "20",
  imageUrl: "",
  validFrom: "",
  validUntil: "",
  minimumOrderAmount: "10",
  isActive: true,
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Unable to read the selected image"));
    reader.readAsDataURL(file);
  });

const dateInputToIso = (value: string) => new Date(`${value}T12:00:00`).toISOString();
const clampNonNegativeNumberInput = (value: string) => {
  if (value === "") return value;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return "";
  return String(Math.max(0, parsed));
};
const getTodayDateInputValue = () => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export function AddOfferModal({
  open,
  onClose,
  initialOffer,
}: {
  open: boolean;
  onClose: () => void;
  initialOffer?: Offer | null;
}) {
  const dispatch = useAppDispatch();
  const submitting = useAppSelector((state) => state.offers.mutating);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<OfferFormState>(createEmptyForm());
  const [submitError, setSubmitError] = useState<string | null>(null);
  const imageError = submitError === "Image is required" ? submitError : null;
  const todayDate = getTodayDateInputValue();

  useEffect(() => {
    if (!open) return;
    if (initialOffer) {
      const discountText = initialOffer.discountText.trim();
      const percentMatch = discountText.match(/(\d+)\s*%/);
      const amountMatch = discountText.match(/₹\s*(\d+)/);

        setForm({
          title: initialOffer.title,
          description: initialOffer.description,
          discountType: amountMatch ? "AMOUNT" : "PERCENT",
          discountValue: percentMatch?.[1] ?? amountMatch?.[1] ?? "20",
          imageUrl: initialOffer.imageUrl ?? "",
        validFrom: "",
          validUntil: "",
          minimumOrderAmount: "10",
          isActive: initialOffer.isActive,
        });
    } else {
      setForm(createEmptyForm());
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, initialOffer]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    if (form.validFrom && form.validFrom < todayDate) {
      setSubmitError("Valid From cannot be before today");
      return;
    }
    if (form.validUntil && form.validUntil < todayDate) {
      setSubmitError("Valid Until cannot be before today");
      return;
    }
    if (form.validFrom && form.validUntil && form.validUntil < form.validFrom) {
      setSubmitError("Valid Until cannot be before Valid From");
      return;
    }
    if (!form.imageUrl.trim()) {
      setSubmitError("Image is required");
      return;
    }
    const discountText =
      form.discountType === "PERCENT" ? `${form.discountValue}% OFF` : `₹${form.discountValue} OFF`;

    const payload = {
      title: form.title,
      description: form.description,
      discountText,
      imageUrl: form.imageUrl.trim(),
      validFrom: form.validFrom ? dateInputToIso(form.validFrom) : undefined,
      validUntil: form.validUntil ? dateInputToIso(form.validUntil) : undefined,
      isActive: form.isActive,
    };

    try {
      if (initialOffer) {
        await dispatch(updateOfferThunk({ id: initialOffer.id, data: payload })).unwrap();
      } else {
        await dispatch(createOfferThunk(payload)).unwrap();
      }
      await dispatch(fetchOffersThunk()).unwrap();
      onClose();
    } catch (error) {
      setSubmitError((error as Error).message || "Unable to save offer");
    }
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

  return (
    <Modal open={open} onClose={onClose} title={initialOffer ? "Edit Offer" : "Create New Offer"}>
      <form onSubmit={submit} className="w-full max-w-[calc(100vw-56px)]">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] text-[#6b665f]">Title Name</label>
            <Input
              placeholder="Enter Offer Name"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            {imageError ? <p className="mb-1 text-[11px] text-[#d65c5c]">{imageError}</p> : null}
            <div className="flex h-[92px] items-center justify-center overflow-hidden rounded-[6px] border border-dashed border-[#e3cfa8] bg-white text-[#8f867d]">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => void handleImageChange(event)}
                className="hidden"
              />
              {form.imageUrl ? (
                <button
                  type="button"
                  className="flex h-full w-full items-center justify-center p-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img
                    src={form.imageUrl}
                    alt="Selected offer"
                    className="h-full w-full rounded-[4px] object-contain"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-3 text-[13px] text-[#7f7568]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="flex h-7 w-7  justify-center rounded-full border border-[#b7b0a6] text-[22px] leading-none">
                    +
                  </span>
                  add
                </button>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">Discount Type</label>
              <Select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as OfferFormState["discountType"] })}
                className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
              >
                <option value="PERCENT">Percentage</option>
                <option value="AMOUNT">Amount</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">Discount %</label>
              <Input
                type="number"
                min={0}
                step="1"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: clampNonNegativeNumberInput(e.target.value) })}
                className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">Valid From *</label>
              <Input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                min={todayDate}
                className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] text-[#6b665f]">Valid Until *</label>
              <Input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                min={todayDate}
                className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] text-[#6b665f]">Minimum Order Amount</label>
            <Input
              type="number"
              min={0}
              step="1"
              value={form.minimumOrderAmount}
              onChange={(e) => setForm({ ...form, minimumOrderAmount: clampNonNegativeNumberInput(e.target.value) })}
              className="h-10 rounded-[6px] border-[#ded9d1] bg-[#fafafa] px-3 text-[12px]"
            />
          </div>

          <label className="flex items-center gap-2 pt-1 text-[11px] text-[#6f685f]">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 accent-[#d2a55f]"
            />
            Active (visible to customers)
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
              disabled={submitting}
              className="h-10 rounded-[6px] border-[#9a742f] bg-[#9a742f] text-[13px] font-medium text-white hover:border-[#866426] hover:bg-[#866426]"
            >
              <span className="inline-flex items-center gap-2">
                {submitting ? (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.22" strokeWidth="3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : null}
                {initialOffer ? (submitting ? "Saving..." : "Save") : submitting ? "Creating..." : "Create"}
              </span>
            </Button>
          </div>
          {submitError && submitError !== "Image is required" ? (
            <p className="text-[11px] text-[#d65c5c]">{submitError}</p>
          ) : null}
        </div>
      </form>
    </Modal>
  );
}
