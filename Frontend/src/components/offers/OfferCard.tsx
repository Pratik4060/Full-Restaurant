import { useAppDispatch } from "../../app/hooks";
import { toggleOfferThunk } from "../../features/offers/offersSlice";
import type { Offer } from "../../types/api";
import { Button } from "../ui/Button";

export function OfferCard({ offer }: { offer: Offer }) {
  const dispatch = useAppDispatch();

  return (
    <div className="overflow-hidden rounded-lg border border-[#eadfce] bg-white shadow-[0_4px_10px_rgba(44,33,18,0.04)]">
      <img
        src={offer.imageUrl ?? "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800"}
        alt={offer.title}
        className="h-32 w-full object-cover"
      />
      <div className="p-3">
        <h3 className="text-[12px] font-semibold text-[#26221d]">{offer.title}</h3>
        <p className="mt-2 line-clamp-2 min-h-8 text-[10px] leading-4 text-[#787169]">{offer.description}</p>
        <div className="mt-2 flex items-center gap-1.5 text-[9px] font-medium">
          <span className="rounded bg-[#eff8ed] px-2 py-0.5 text-[#4d9957]">
            {offer.isActive ? "ACTIVE" : "INACTIVE"}
          </span>
          <span className="rounded bg-[#f5ecdf] px-2 py-0.5 text-brand-700">{offer.discountText}</span>
        </div>
        <p className="mt-3 text-[10px] text-[#8b857c]">Valid until {offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : "N/A"}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => void dispatch(toggleOfferThunk({ id: offer.id, isActive: !offer.isActive }))}
          >
            Edit
          </Button>
          <button className="flex h-9 w-9 items-center justify-center rounded-md border border-[#f0d1d1] text-[#e28282]">
            x
          </button>
        </div>
      </div>
    </div>
  );
}
