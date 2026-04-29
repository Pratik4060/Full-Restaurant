import { useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import {
  fetchMenuItemsThunk,
  removeMenuItemLocal,
  restoreMenuItemLocal,
  toggleMenuAvailabilityThunk,
} from "../../features/menu/menuSlice";
import { menuApi } from "../../services/menuApi";
import type { MenuItem } from "../../types/api";
import { Switch } from "../ui/Switch";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import deletebtn  from  "../../../public/assets/delete.svg"
import editbtn from "../../../public/assets/edit.svg"

export function MenuItemCard({ item, onEdit }: { item: MenuItem; onEdit: (item: MenuItem) => void }) {
  const dispatch = useAppDispatch();
  const mealTypeLabel = item.type === "BREAKFAST" ? "Breakfast" : item.type === "LUNCH" ? "Lunch" : "Dinner";
  const priceValue = `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(item.price)}`;
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleteError(null);
    setDeleting(true);
    try {
      dispatch(removeMenuItemLocal(item.id));
      await menuApi.remove(item.id);
    } catch (error) {
      const message = (error as Error).message || "Failed to delete menu item";
      setDeleteError(message);
      dispatch(restoreMenuItemLocal(item.id));
      void dispatch(fetchMenuItemsThunk(undefined));
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="flex h-full min-h-[430px] flex-col overflow-hidden rounded-[12px] border border-[#e2ddd4] bg-white shadow-[0_6px_18px_rgba(44,33,18,0.06)]">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.name} className="h-[168px] w-full object-cover" />
      ) : (
        <div className="flex h-[168px] w-full items-center justify-center bg-[#f5f1ea] text-[12px] text-[#8b8175]">
          Image required
        </div>
      )}
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
            className="flex h-9 w-30 items-center justify-center rounded-[4px]  bg-[#9d7b42]   font-medium text-white transition hover:bg-[#8a6835]"
            onClick={() => onEdit(item)}
          >
            <span className="inline-flex items-center gap-2">
              <img  src= {editbtn} alt=""/>
              Edit
            </span>
          </button>
          <button
            className="flex h-9 w-12 items-center justify-center rounded-[4px] border border-[#ff6f6f] bg-white text-[#ff5d5d] transition hover:bg-[#fff5f5]"
            onClick={() => setConfirmDeleteOpen(true)}
            type="button"
            aria-label="Delete item"
          >
            <img src={deletebtn} alt="delete"/>
          </button>
        </div>
        {deleteError ? <p className="mt-2 text-[10px] text-[#d65c5c]">{deleteError}</p> : null}
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        pending={deleting}
        message={`Are you sure you want to delete "${item.name}"?`}
      />
    </div>
  );
}
