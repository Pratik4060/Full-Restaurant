import { useAppDispatch } from "../../app/hooks";
import { deleteOfferThunk, fetchOffersThunk, toggleOfferThunk } from "../../features/offers/offersSlice";
import type { Offer } from "../../types/api";
import { Switch } from "../ui/Switch";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useState } from "react";
import deletebtn from "../../../public/assets/delete.svg"
import editbtn from "../../../public/assets/edit.svg"

const formatDate = (value: string | null) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString("en-IN");
};

const formatOfferValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (/off$/i.test(trimmed)) return trimmed;
  return `${trimmed} Off`;
};

export function OfferCard({
  offer,
  onEdit,
}: {
  offer: Offer;
  onEdit: (offer: Offer) => void;
}) {
  const dispatch = useAppDispatch();
  const statusLabel = offer.isActive ? "Valid Now" : "Inactive";
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await dispatch(deleteOfferThunk(offer.id)).unwrap();
      await dispatch(fetchOffersThunk()).unwrap();
    } catch (error) {
      console.error("Failed to delete offer", error);
    } finally {
      setDeleting(false);
      setConfirmDeleteOpen(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[12px] w-[300px] border border-[#ddd5c8] bg-white shadow-[0_6px_16px_rgba(44,33,18,0.05)]">
      {offer.imageUrl ? (
        <img src={offer.imageUrl} alt={offer.title} className="h-[200px] w-full object-cover" />
      ) : (
        <div className="flex h-[200px] w-full items-center justify-center bg-[#f5f1ea] text-[12px] text-[#8b8175]">
          Image required
        </div>
      )}
      <div className="px-3 pb-3 pt-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-[13px] font-semibold leading-5 text-[#23201b]">{offer.title}</h3>
          <Switch
            checked={offer.isActive}
            onChange={() => void dispatch(toggleOfferThunk({ id: offer.id, isActive: !offer.isActive }))}
          />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <span
            className={`rounded-[6px] px-2 py-1 text-[10px] font-medium ${
              offer.isActive ? "bg-[#e8f8ea] text-[#3ca64f]" : "bg-[#f0f0f0] text-[#666666]"
            }`}
          >
            {statusLabel}
          </span>
          <span className="rounded-[6px] bg-[#f4d8ad] px-2 py-1 text-[10px] font-medium text-[#8b642c]">
            {formatOfferValue(offer.discountText)}
          </span>
        </div>

        <p className="mt-3 min-h-[44px] text-[11px] leading-5 text-[#5f5a53]">{offer.description}</p>


        <div className="mt-3  border-[#ece6db] pt-3 text-[12px] text-[#2d2925]">
          <div className="flex items-center gap-1 text-[#8b857c]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="17" rx="2" />
              <path d="M8 2v4M16 2v4M3 10h18" />
            </svg>
            <span>
              {formatDate(offer.validFrom)} - {formatDate(offer.validUntil)}
            </span>
          </div>
        </div>

        <div className="mt-3  flex items-center justify-between border-t border-[#ece6db] pt-3  ">
          <button
            type="button"
            onClick={() => onEdit(offer)}
            className="flex h-8 w-30 items-center justify-center rounded-[4px]  bg-[#9d7b42]  text-[12px] font-medium text-white transition hover:bg-[#8a6835]"
          >
            <span className="inline-flex items-center gap-2 ">
                            <img  src= {editbtn} alt="editbtn"/>

              Edit
            </span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmDeleteOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#ffb6b6] text-[#ff5d5d] transition hover:bg-[#fff5f5]"
            aria-label="Delete offer"
          >
             <img src={deletebtn}  alt="delete"/>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onCancel={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        pending={deleting}
        message={`Are you sure you want to delete "${offer.title}"?`}
      />
    </div>
  );
}
