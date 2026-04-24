import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { PageHeader } from "../components/layout/PageHeader";
import { NewOrderModal } from "../components/orders/NewOrderModal";
import { OrderCard } from "../components/orders/OrderCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { fetchMenuItemsThunk } from "../features/menu/menuSlice";
import {
  fetchOrdersThunk,
  setOrdersSearch,
  setOrdersStatusFilter,
} from "../features/orders/ordersSlice";

const searchIconSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#9a968f" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>`
);

const dropdownIconSvg = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8" fill="#2b2b2b"><path d="M1 1l5 6 5-6"/></svg>`
);

export function OrdersPage() {
  const dispatch = useAppDispatch();
  const { list, search, statusFilter } = useAppSelector((s) => s.orders);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    void dispatch(fetchOrdersThunk(undefined));
    void dispatch(fetchMenuItemsThunk(undefined));
  }, [dispatch]);

  const filtered = useMemo(() => {
    return list.filter((o) => {
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [list, search, statusFilter]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders"
        subtitle="Manage and track all orders"
        action={<Button onClick={() => setOpen(true)}>+ New Order</Button>}
      />

      <div className="grid gap-3 rounded-2xl border border-[#e6ddd0] bg-white p-4 shadow-[0_8px_22px_rgba(44,33,18,0.05)] md:grid-cols-[1fr_1fr]">
        <Input
          placeholder="Search order or customer"
          value={search}
          onChange={(e) => dispatch(setOrdersSearch(e.target.value))}
          className="h-10 bg-white pl-11 pr-4 text-[12px] placeholder:text-[#a8a39a]"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,${searchIconSvg}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "14px center",
            backgroundSize: "20px 20px",
          }}
        />
        <Select
          value={statusFilter}
          onChange={(e) =>
            dispatch(
              setOrdersStatusFilter(
                e.target.value as "ALL" | "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED"
              )
            )
          }
          className="h-10 appearance-none bg-white pr-10 text-[12px]"
          style={{
            backgroundImage: `url("data:image/svg+xml;charset=UTF-8,${dropdownIconSvg}")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "calc(100% - 16px) center",
            backgroundSize: "10px 8px",
          }}
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELED">Canceled</option>
        </Select>
      </div>

      <div className="grid px-6  gap-8 md:grid-cols-2 xl:gap-x-15">
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <NewOrderModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
