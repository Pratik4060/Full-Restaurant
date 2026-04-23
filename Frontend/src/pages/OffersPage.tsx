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
        action={<Button onClick={() => { setEditingOffer(null); setOpen(true); }}>+ Add Offer</Button>}
      />

      <div className="rounded-[18px] border border-[#e6ddd0] bg-white p-4 shadow-[0_8px_22px_rgba(44,33,18,0.05)]">
        <Input value={search} onChange={(e) => dispatch(setOfferSearch(e.target.value))} placeholder="Search by name" />
      </div>

      <section className="space-y-4">
        <div>
          <p className="mb-3 text-[12px] font-semibold text-[#2b2b2b]">Active Offers ({activeOffers.length})</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {activeOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} onEdit={setEditingOffer} />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-[12px] font-semibold text-[#2b2b2b]">Inactive Offers ({inactiveOffers.length})</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {inactiveOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} onEdit={setEditingOffer} />
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
