import { useEffect, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { deleteMenuItemThunk, toggleMenuAvailabilityThunk } from "../../features/menu/menuSlice";
import type { MenuItem } from "../../types/api";
import { Switch } from "../ui/Switch";

const fallbackImage =
  "https://images.unsplash.com/photo-1547592180-85f173990554?w=1200&auto=format&fit=crop&q=80";

export function MenuItemCard({ item, onEdit }: { item: MenuItem; onEdit: (item: MenuItem) => void }) {
  const dispatch = useAppDispatch();
  const mealTypeLabel = item.type === "BREAKFAST" ? "Breakfast" : item.type === "LUNCH" ? "Lunch" : "Dinner";
  const priceValue = `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(item.price)}`;
  const [imageSrc, setImageSrc] = useState(item.imageUrl || fallbackImage);

  useEffect(() => {
    setImageSrc(item.imageUrl || fallbackImage);
  }, [item.imageUrl]);

  return (
    <div className="flex h-full min-h-[430px] flex-col overflow-hidden rounded-[12px] border border-[#e2ddd4] bg-white shadow-[0_6px_18px_rgba(44,33,18,0.06)]">
      <img
        src={imageSrc}
        alt={item.name}
        className="h-[168px] w-full object-cover"
        onError={() => setImageSrc(fallbackImage)}
      />
      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[13px] font-semibold text-[#23201b]">{item.name}</h3>
          <Switch
            checked={item.isAvailable}
            onChange={() => void dispatch(toggleMenuAvailabilityThunk({ id: item.id, isAvailable: !item.isAvailable }))}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-[5px] bg-[#f4d8ad] px-2.5 py-1 text-[10px] font-medium text-[#5e4522]">{mealTypeLabel}</span>
          {item.isBestseller ? (
            <span className="rounded-[5px] bg-[#f4d8ad] px-2.5 py-1 text-[10px] font-medium text-[#5e4522]">Bestseller</span>
          ) : null}
        </div>

        <p className="mt-2 line-clamp-2 min-h-[38px] text-[11px] leading-5 text-[#6f6961]">{item.description}</p>

        <div className="mt-3 space-y-2  text-[12px] text-[#2d2925]">
          <div className="flex items-center justify-between">
            <span>Price</span>
            <span className="font-medium">{priceValue}</span>
          </div>
          <div className="flex items-center pt-3 justify-between">
            <span>Prep Time</span>
            <span className="text-[#5f5951]">{item.prepTimeMins} mins</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between gap-5 border-t border-[#ece6db] pt-3">
          <button
            type="button"
            className="flex h-9 flex-[0.8] items-center justify-center rounded-[4px] border border-[#9d7b42] bg-[#9d7b42] px-3 text-[12px] font-medium text-white transition hover:bg-[#8a6835]"
            onClick={() => onEdit(item)}
          >
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              Edit
            </span>
          </button>
          <button
            className="flex h-9 w-12 items-center justify-center rounded-[4px] border border-[#ff6f6f] bg-white text-[#ff5d5d] transition hover:bg-[#fff5f5]"
            onClick={() => void dispatch(deleteMenuItemThunk(item.id))}
            type="button"
            aria-label="Delete item"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 13H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
