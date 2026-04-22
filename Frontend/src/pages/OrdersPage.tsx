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

      <div className="grid gap-3 rounded-2xl border border-[#e6ddd0] bg-white p-4 shadow-[0_8px_22px_rgba(44,33,18,0.05)] md:grid-cols-2">
        <Input
          placeholder="Search order or customer"
          value={search}
          onChange={(e) => dispatch(setOrdersSearch(e.target.value))}
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
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELED">Canceled</option>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <NewOrderModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
