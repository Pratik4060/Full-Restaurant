import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createOrderThunk } from "../../features/orders/ordersSlice";
import type { MenuItem } from "../../types/api";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

type OrderItemDraft = {
  id: string;
  query: string;
  menuItemId: string;
  quantity: number;
  open: boolean;
};

const newDraft = (): OrderItemDraft => ({
  id: crypto.randomUUID(),
  query: "",
  menuItemId: "",
  quantity: 1,
  open: false,
});

const formatCurrency = (value: number) =>
  `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;

export function NewOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const menuItems = useAppSelector((s) => s.menu.list);
  const draftRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [drafts, setDrafts] = useState<OrderItemDraft[]>([newDraft()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCustomerName("");
    setCustomerPhone("");
    setTableNumber("");
    setDrafts([newDraft()]);
    setSubmitting(false);
  }, [open]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      setDrafts((current) =>
        current.map((draft) => {
          if (!draft.open) return draft;
          const wrapper = draftRefs.current[draft.id];
          if (wrapper && wrapper.contains(target)) return draft;
          return { ...draft, open: false };
        }),
      );
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, []);

  const resolvedDrafts = useMemo(
    () =>
      drafts.map((draft) => {
        const filteredItems = draft.query.trim()
          ? menuItems.filter(
              (item) =>
                item.name.toLowerCase().includes(draft.query.toLowerCase()) ||
                item.category.toLowerCase().includes(draft.query.toLowerCase()),
            )
          : menuItems.slice(0, 6);
        const matchedItem = menuItems.find((item) => item.id === draft.menuItemId) ?? null;
        return { ...draft, filteredItems, matchedItem };
      }),
    [drafts, menuItems],
  );

  const updateDraft = (id: string, patch: Partial<OrderItemDraft>) => {
    setDrafts((current) => current.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)));
  };

  const addDraft = () => setDrafts((current) => [...current, newDraft()]);

  const removeDraft = (id: string) => {
    setDrafts((current) => (current.length > 1 ? current.filter((draft) => draft.id !== id) : current));
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const phone = customerPhone.trim();
    const items = drafts
      .filter((draft) => draft.menuItemId && draft.quantity > 0)
      .map((draft) => ({ menuItemId: draft.menuItemId, quantity: draft.quantity }));

    if (!customerName.trim() || !tableNumber.trim() || items.length === 0) return;

    setSubmitting(true);
    try {
      await dispatch(
        createOrderThunk({
          customerName,
          ...(phone ? { customerPhone: phone } : {}),
          tableNumber,
          guestCount: 1,
          items,
        }),
      ).unwrap();

      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Order">
      <form onSubmit={submit} className="space-y-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[#2d2721]">Customer Name</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter Customer Name"
              className="h-9 rounded-[6px] border-[#ded4c8] bg-[#f7f7f7] px-3 text-[12px] placeholder:text-[#b4ada6]"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[#2d2721]">Mobile Number</label>
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="Enter Mobile Number"
              inputMode="numeric"
              pattern="[0-9]{10}"
              className="h-9 rounded-[6px] border-[#ded4c8] bg-[#f7f7f7] px-3 text-[12px] placeholder:text-[#b4ada6]"
            />
          </div>
          <div>
            <label className="mb-2 block text-[12px] font-medium text-[#2d2721]">Table Number</label>
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g T-1"
              className="h-9 rounded-[6px] border-[#ded4c8] bg-[#f7f7f7] px-3 text-[12px] placeholder:text-[#b4ada6]"
              required
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={addDraft}
            disabled={submitting}
            className="inline-flex items-center gap-2 text-[13px] font-medium text-[#c79d67] transition hover:text-[#ad7d41]"
          >
            <span>Add Item</span>
            <span className="text-[22px] leading-none">+</span>
          </button>
        </div>

        <div className="space-y-5">
          {resolvedDrafts.map((draft, index) => {
            return (
              <div
                key={draft.id}
                ref={(node) => {
                  draftRefs.current[draft.id] = node;
                }}
                className="grid gap-4 md:grid-cols-[minmax(0,1fr)_96px_auto] md:items-end"
              >
                <div className="relative min-w-0">
                  <label className="mb-2 block text-[12px] font-medium text-[#2d2721]">Order Items</label>
                  <Input
                    value={draft.query}
                    onChange={(e) =>
                      updateDraft(draft.id, {
                        query: e.target.value,
                        menuItemId: "",
                        open: true,
                      })
                    }
                    onFocus={() => updateDraft(draft.id, { open: true })}
                    placeholder="Search by order"
                    className="h-9 rounded-[6px] border-[#ded4c8] bg-[#f7f7f7] px-3 text-[12px] placeholder:text-[#b4ada6]"
                  />

                  {draft.open ? (
                    <div className="absolute z-20 mt-2 w-full rounded-[12px] border border-[#ded7cc] bg-white shadow-[0_12px_24px_rgba(44,33,18,0.08)]">
                      {(draft.filteredItems.length > 0 ? draft.filteredItems : ([] as MenuItem[])).slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            updateDraft(draft.id, {
                              menuItemId: item.id,
                              query: item.name,
                              open: false,
                            })
                          }
                          className="flex w-full items-center justify-between border-b border-[#f4eee4] px-4 py-2.5 text-left text-[12px] text-[#2b2621] last:border-b-0 hover:bg-[#fbf7f1]"
                        >
                          <span>{item.name}</span>
                          <span className="text-[#9d8f7f]">{formatCurrency(item.price)}</span>
                        </button>
                      ))}
                      {draft.filteredItems.length === 0 ? (
                        <div className="px-4 py-3 text-[12px] text-[#9d8f7f]">No items found</div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="md:w-[96px]">
                  <label className="mb-2 block text-[12px] font-medium text-[#2d2721]">Quantity</label>
                  <Input
                    type="number"
                    min={1}
                    value={draft.quantity}
                    onChange={(e) => updateDraft(draft.id, { quantity: Number(e.target.value || 1) })}
                    className="h-9 rounded-[6px] border-[#ded4c8] bg-white px-3 text-[12px]"
                  />
                </div>

                {index > 0 ? (
                  <button
                    type="button"
                    onClick={() => removeDraft(draft.id)}
                    disabled={submitting}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#ffb1b1] text-[18px] leading-none text-[#ff4f4f] transition hover:bg-[#fff5f5] md:mb-[1px]"
                    aria-label={`Remove item ${index + 1}`}
                  >
                    ×
                  </button>
                ) : (
                  <div className="hidden h-9 w-9 md:block" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 pt-2 md:grid-cols-[1fr_1fr]">
          <Button
            type="button"
            variant="secondary"
            className="h-10 rounded-[8px] border-[#efc98f] bg-white text-[14px] font-medium text-[#c79d67] hover:bg-[#fffaf2]"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting}
            className="h-10 rounded-[8px] border-[#9a742f] bg-[#9a742f] text-[14px] font-medium text-white hover:border-[#866426] hover:bg-[#866426] disabled:cursor-wait disabled:opacity-75"
          >
            {submitting ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
