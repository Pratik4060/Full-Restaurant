import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { PageHeader } from "../components/layout/PageHeader";
import { AddOfferModal } from "../components/offers/AddOfferModal";
import { OfferCard } from "../components/offers/OfferCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { fetchOffersThunk, setOfferSearch } from "../features/offers/offersSlice";
import type { Offer } from "../types/api";

export function OffersPage() {
  const dispatch = useAppDispatch();
  const { list, search } = useAppSelector((s) => s.offers);
  const [open, setOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  useEffect(() => {
    void dispatch(fetchOffersThunk());
  }, [dispatch]);

  const filtered = useMemo(
    () => list.filter((o) => o.title.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  const activeOffers = filtered.filter((offer) => offer.isActive);
  const inactiveOffers = filtered.filter((offer) => !offer.isActive);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Special Offers"
        subtitle="Manage promotional offers and deals"
        action={
          <Button
            className="h-9 rounded-[6px] border-[#9a742f] bg-[#9a742f] px-4 text-[12px] font-medium text-white hover:border-[#866426] hover:bg-[#866426]"
            onClick={() => {
              setEditingOffer(null);
              setOpen(true);
            }}
          >
            + Add Offer
          </Button>
        }
      />

      <div className="rounded-[18px] border border-[#e6ddd0] bg-white p-6 shadow-[0_8px_22px_rgba(44,33,18,0.05)]">
        <label className="flex h-11 items-center rounded-[8px] border border-[#dcd6ce] bg-[#f5f5f5] px-3 transition focus-within:border-[#c9c0b5] focus-within:bg-white">
          <svg
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4 shrink-0 text-[#9f968b]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <Input
            value={search}
            onChange={(e) => dispatch(setOfferSearch(e.target.value))}
            placeholder="Search by name"
            className="h-full border-0 bg-transparent px-0 text-[13px] placeholder:text-[#b2aba1] focus:border-0 focus:bg-transparent"
          />
        </label>
      </div>

      <section className="space-y-8">
        <div>
          <p className="mb-6 text-[20px] font-semibold text-[#22201c]">Active Offers ({activeOffers.length})</p>
          <div className="grid justify-items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {activeOffers.map((offer) => (
              <div key={offer.id} className="w-full max-w-[182px] sm:max-w-none">
                <OfferCard offer={offer} onEdit={setEditingOffer} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-6 text-[20px] font-semibold text-[#22201c]">Inactive Offers ({inactiveOffers.length})</p>
          <div className="grid justify-items-start gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {inactiveOffers.map((offer) => (
              <div key={offer.id} className="w-full max-w-[182px] sm:max-w-none">
                <OfferCard offer={offer} onEdit={setEditingOffer} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <AddOfferModal
        open={open || Boolean(editingOffer)}
        initialOffer={editingOffer}
        onClose={() => {
          setOpen(false);
          setEditingOffer(null);
        }}
      />
    </div>
  );
}
