import { useAppDispatch } from "../../app/hooks";
import { deleteOfferThunk, toggleOfferThunk } from "../../features/offers/offersSlice";
import type { Offer } from "../../types/api";
import { Switch } from "../ui/Switch";

const fallbackImage =
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&auto=format&fit=crop&q=80";

const formatDate = (value: string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-IN");
};

export function OfferCard({
  offer,
  onEdit,
}: {
  offer: Offer;
  onEdit: (offer: Offer) => void;
}) {
  const dispatch = useAppDispatch();
  const statusLabel = offer.isActive ? "Scheduled" : "Inactive";

  return (
    <div className="overflow-hidden rounded-[12px] border border-[#e2ddd4] bg-white shadow-[0_6px_18px_rgba(44,33,18,0.06)]">
      <img
        src={offer.imageUrl ?? fallbackImage}
        alt={offer.title}
        className="h-[178px] w-full object-cover"
        onError={(event) => {
          event.currentTarget.src = fallbackImage;
        }}
      />
      <div className="px-3 pb-3 pt-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[13px] font-semibold text-[#23201b]">{offer.title}</h3>
          <Switch
            checked={offer.isActive}
            onChange={() => void dispatch(toggleOfferThunk({ id: offer.id, isActive: !offer.isActive }))}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <span className={`rounded-[5px] px-2.5 py-1 text-[10px] font-medium ${offer.isActive ? "bg-[#cfcfcf] text-[#3f3f3f]" : "bg-[#f4d8ad] text-[#5e4522]"}`}>
            {statusLabel}
          </span>
          <span className="rounded-[5px] bg-[#f4d8ad] px-2.5 py-1 text-[10px] font-medium text-[#5e4522]">
            {offer.discountText}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 min-h-[38px] text-[11px] leading-5 text-[#6f6961]">{offer.description}</p>

        <div className="mt-3 border-t border-[#ece6db] pt-3 text-[12px] text-[#2d2925]">
          <div className="flex items-center gap-1 text-[#8b857c]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18" />
            </svg>
            <span>{formatDate(offer.createdAt)} - {formatDate(offer.validUntil)}</span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 border-t border-[#ece6db] pt-3">
          <button
            type="button"
            onClick={() => onEdit(offer)}
            className="flex h-8 flex-1 items-center justify-center rounded-[4px] border border-[#9d7b42] bg-[#9d7b42] px-3 text-[12px] font-medium text-white transition hover:bg-[#8a6835]"
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
            type="button"
            onClick={() => void dispatch(deleteOfferThunk(offer.id))}
            className="flex h-9 w-10 items-center justify-center rounded-[4px] border border-[#ffb6b6] text-[#ff5d5d] transition hover:bg-[#fff5f5]"
            aria-label="Delete offer"
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
