import { useState, type FormEvent } from "react";
import { useAppDispatch } from "../../app/hooks";
import { createOfferThunk } from "../../features/offers/offersSlice";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

export function AddOfferModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({
    title: "",
    description: "",
    discountText: "20% OFF",
    imageUrl: "",
    validUntil: "",
    isActive: true,
  });

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await dispatch(
      createOfferThunk({
        ...form,
        imageUrl: form.imageUrl || undefined,
        validUntil: form.validUntil || undefined,
      })
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Offer">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-[11px] text-[#706a63]">Title Name</label>
          <Input placeholder="Enter Offer Name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#706a63]">Description</label>
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-[#706a63]">Image URL</label>
          <Input placeholder="Paste image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-[#706a63]">Discount Text</label>
            <Input placeholder="20% OFF / Rs. 200 OFF" value={form.discountText} onChange={(e) => setForm({ ...form, discountText: e.target.value })} required />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#706a63]">Valid Until</label>
            <Input type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" className="min-w-28" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="min-w-32">Create</Button>
        </div>
      </form>
    </Modal>
  );
}
