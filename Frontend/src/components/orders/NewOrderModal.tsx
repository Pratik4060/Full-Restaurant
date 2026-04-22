import { useMemo, useState, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { createOrderThunk } from "../../features/orders/ordersSlice";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { Select } from "../ui/Select";

export function NewOrderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dispatch = useAppDispatch();
  const menuItems = useAppSelector((s) => s.menu.list);

  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [menuItemId, setMenuItemId] = useState("");
  const [quantity, setQuantity] = useState(1);

  const selectedItemName = useMemo(
    () => menuItems.find((x) => x.id === menuItemId)?.name ?? "",
    [menuItems, menuItemId]
  );

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!menuItemId) return;

    await dispatch(
      createOrderThunk({
        customerName,
        tableNumber,
        guestCount,
        items: [{ menuItemId, quantity }],
      })
    );

    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Order">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-[#706a63]">Customer Name</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Enter Customer Name" required />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#706a63]">Table Number</label>
            <Input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g. T-1" required />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] text-[#706a63]">Guest Count</label>
            <Input type="number" min={1} value={guestCount} onChange={(e) => setGuestCount(Number(e.target.value))} required />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-[#706a63]">Quantity</label>
            <Input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} required />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] text-[#706a63]">Order Item</label>
          <Select value={menuItemId} onChange={(e) => setMenuItemId(e.target.value)} required>
            <option value="">Select menu item</option>
            {menuItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} - Rs. {item.price}
              </option>
            ))}
          </Select>
        </div>

        {selectedItemName && <p className="text-[11px] text-[#6f6a63]">Selected: {selectedItemName}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" className="min-w-28" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="min-w-32">Create Order</Button>
        </div>
      </form>
    </Modal>
  );
}
