import { useAppDispatch } from "../../app/hooks";
import { useAppSelector } from "../../app/hooks";
import { optimisticSetOrderStatus, updateOrderStatusThunk } from "../../features/orders/ordersSlice";
import type { Order, OrderStatus } from "../../types/api";
import { StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { CSSProperties } from "react";

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

const primaryActionLabel: Partial<Record<OrderStatus, string>> = {
  PENDING: "Start Preparing",
  PREPARING: "Mark Ready",
  READY: "Complete Order",
};

const primaryActionStyles: Partial<Record<OrderStatus, string>> = {
  PENDING: "border-[#ffcb19] bg-[#ffcb19] text-[#1b1b1b] hover:bg-[#f3bf08] hover:border-[#f3bf08]",
  PREPARING: "border-[#1458f0] bg-[#1458f0] text-white hover:bg-[#0f4cd7] hover:border-[#0f4cd7]",
  READY: "border-[#38bb37] bg-[#38bb37] text-[#101010] hover:bg-[#2fa530] hover:border-[#2fa530]",
};

const primaryActionInlineStyle: Partial<Record<OrderStatus, CSSProperties>> = {
  PENDING: { backgroundColor: "#ffcb19", borderColor: "#ffcb19", color: "#1b1b1b" },
  PREPARING: { backgroundColor: "#1458f0", borderColor: "#1458f0", color: "#ffffff" },
  READY: { backgroundColor: "#38bb37", borderColor: "#38bb37", color: "#101010" },
};

const cancelInlineStyle: CSSProperties = {
  backgroundColor: "#ffffff",
  borderColor: "#ffb6b6",
  color: "#ff5656",
};

const formatCurrency = (value: number) => `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value)}`;

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(new Date(value));

export function OrderCard({ order }: { order: Order }) {
  const dispatch = useAppDispatch();
  const isUpdating = useAppSelector((state) => state.orders.optimisticStatusById[order.id] !== undefined);
  const primaryNext = nextStatus[order.status];
  const primaryLabel = order.status === "CANCELED" || order.status === "COMPLETED" ? null : primaryActionLabel[order.status] ?? null;
  const primaryClassName = order.status ? primaryActionStyles[order.status] ?? "" : "";
  const itemCount = order.items.length;

  return (
    <div className="flex h-full min-h-[414px] w-full flex-col rounded-[18px] border border-[#ece4d8] bg-white px-6 py-6 shadow-[0_5px_16px_rgba(44,33,18,0.06)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium tracking-wide text-[#23211f]">{order.orderNumber}</p>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-1.5">
        <p className="text-[14px] font-medium text-[#22201d]">{order.customerName}</p>
        <p className="text-[12px] text-[#4f4a44]">Table: {order.tableNumber}</p>
        <p className="text-[12px] text-[#4f4a44]">Items: {itemCount}</p>
      </div>

      <div className="my-4 border-t border-[#d7d1c7]" />

      <div className="space-y-3 text-[12px]">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4 text-[#2d2925]">
            <span className="pr-2 leading-6">
              {item.quantity}x {item.menuItem?.name ?? "Item"}
            </span>
            <span className="whitespace-nowrap leading-6">{formatCurrency(item.totalPrice)}</span>
          </div>
        ))}
      </div>

      <div className="my-4 border-t border-[#d7d1c7]" />

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[#23211f]">Total</span>
        <p className="text-[16px] font-medium text-[#22c322]">{formatCurrency(order.totalAmount)}</p>
      </div>

      <div className="my-4 border-t border-[#d7d1c7]" />

      <div className="space-y-1 text-[12px] text-[#7c746c]">
        <p>Created: {formatDateTime(order.createdAt)}</p>
        <p>Updated: {formatDateTime(order.updatedAt)}</p>
      </div>

<div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row sm:gap-4 sm:flex-wrap">
  {primaryNext && (
    <Button
      onClick={() => {
        dispatch(optimisticSetOrderStatus({ id: order.id, status: primaryNext }));
        void dispatch(updateOrderStatusThunk({ id: order.id, status: primaryNext }));
      }}
      style={primaryActionInlineStyle[order.status]}
      disabled={isUpdating}
      className={`h-10 w-full whitespace-nowrap rounded-md border text-[12px] font-medium leading-tight shadow-none sm:min-w-[190px] sm:flex-[1.35] sm:px-6 sm:text-[13px] md:min-w-[220px] ${primaryClassName}`}
    >
      {isUpdating ? "Updating..." : primaryLabel}
    </Button>
  )}
  {order.status !== "CANCELED" && order.status !== "COMPLETED" && (
    <Button
      variant="danger"
      onClick={() => void dispatch(updateOrderStatusThunk({ id: order.id, status: "CANCELED" }))}
      style={cancelInlineStyle}
      disabled={isUpdating}
      className="h-10 w-full whitespace-nowrap rounded-md border border-[#ffb6b6] bg-white text-[12px] font-medium leading-tight text-[#ff5656] shadow-none hover:bg-[#fff5f5] sm:min-w-[140px] sm:text-[13px]"
    >
      Cancel
    </Button>
  )}
</div>
    </div>
  );
}
