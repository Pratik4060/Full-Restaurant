import { useAppDispatch } from "../../app/hooks";
import { deleteMenuItemThunk, toggleMenuAvailabilityThunk } from "../../features/menu/menuSlice";
import type { MenuItem } from "../../types/api";
import { Button } from "../ui/Button";

export function MenuItemCard({ item }: { item: MenuItem }) {
  const dispatch = useAppDispatch();

  return (
    <div className="overflow-hidden rounded-lg border border-[#eadfce] bg-white shadow-[0_4px_10px_rgba(44,33,18,0.04)]">
      <img
        src={item.imageUrl ?? "https://images.unsplash.com/photo-1544025162-d76694265947?w=800"}
        alt={item.name}
        className="h-32 w-full object-cover"
      />
      <div className="p-3">
        <h3 className="text-[12px] font-semibold text-[#26221d]">{item.name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5 text-[9px] font-medium">
          <span className="rounded bg-[#f5ecdf] px-2 py-0.5 text-brand-700">{item.type}</span>
          <span className="rounded bg-[#f5f3ef] px-2 py-0.5 text-[#7d766d]">{item.category}</span>
          {item.subCategory ? <span className="rounded bg-[#f5f3ef] px-2 py-0.5 text-[#7d766d]">{item.subCategory}</span> : null}
          <span className="rounded bg-[#eff8ed] px-2 py-0.5 text-[#4d9957]">{item.diet}</span>
          {item.isBestseller ? <span className="rounded bg-[#fff5cf] px-2 py-0.5 text-[#9a7a19]">Bestseller</span> : null}
        </div>
        <p className="mt-2 line-clamp-2 min-h-8 text-[10px] leading-4 text-[#787169]">{item.description}</p>
        <div className="mt-3 space-y-1 text-[10px] text-[#6b665f]">
          <div className="flex items-center justify-between">
            <span>Price</span>
            <span className="font-medium text-[#23201b]">Rs. {item.price}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Prep Time</span>
            <span>{item.prepTimeMins} mins</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Likes</span>
            <span>{item.likeCount}</span>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => void dispatch(toggleMenuAvailabilityThunk({ id: item.id, isAvailable: !item.isAvailable }))}
          >
            {item.isAvailable ? "Disable" : "Enable"}
          </Button>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-md border border-[#f0d1d1] text-[#e28282]"
            onClick={() => void dispatch(deleteMenuItemThunk(item.id))}
            type="button"
          >
            x
          </button>
        </div>
      </div>
    </div>
  );
}
