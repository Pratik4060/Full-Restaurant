import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { PageHeader } from "../components/layout/PageHeader";
import { AddOfferModal } from "../components/offers/AddOfferModal";
import { OfferCard } from "../components/offers/OfferCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { fetchOffersThunk, setOfferSearch } from "../features/offers/offersSlice";

export function OffersPage() {
  const dispatch = useAppDispatch();
  const { list, search } = useAppSelector((s) => s.offers);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchOffersThunk());
  }, [dispatch]);

  const filtered = useMemo(
    () => list.filter((o) => o.title.toLowerCase().includes(search.toLowerCase())),
    [list, search]
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Special Offers"
        subtitle="Manage promotional offers and deals"
        action={<Button onClick={() => setOpen(true)}>+ Add Offer</Button>}
      />

      <div className="rounded-2xl border border-[#e6ddd0] bg-white p-4 shadow-[0_8px_22px_rgba(44,33,18,0.05)]">
        <Input value={search} onChange={(e) => dispatch(setOfferSearch(e.target.value))} placeholder="Search by name" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>

      <AddOfferModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
