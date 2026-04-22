import { useAppDispatch } from "../../app/hooks";
import { updateOrderStatusThunk } from "../../features/orders/ordersSlice";
import type { Order, OrderStatus } from "../../types/api";
import { StatusBadge } from "../ui/Badge";
import { Button } from "../ui/Button";

const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  PENDING: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
};

export function OrderCard({ order }: { order: Order }) {
  const dispatch = useAppDispatch();
  const primaryNext = nextStatus[order.status];

  return (
    <div className="rounded-lg border border-[#eadfce] bg-white p-4 shadow-[0_4px_10px_rgba(44,33,18,0.04)]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[12px] font-semibold text-[#2a2a2a]">{order.orderNumber}</p>
        <StatusBadge status={order.status} />
      </div>

      <p className="text-[12px] text-[#5d5852]">{order.customerName}</p>
      <p className="mb-3 text-[10px] text-[#918b84]">Table {order.tableNumber}</p>

      <div className="space-y-1.5 border-y border-[#f1ebe2] py-3 text-[11px]">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-[#3b352f]">
            <span>{item.quantity}x {item.menuItem?.name ?? "Item"}</span>
            <span>Rs. {item.totalPrice}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-[#8b857c]">Total</span>
        <p className="text-[16px] font-semibold text-[#37a151]">Rs. {order.totalAmount}</p>
      </div>

      <div className="mt-4 flex gap-2">
        {primaryNext && (
          <Button
            onClick={() => void dispatch(updateOrderStatusThunk({ id: order.id, status: primaryNext }))}
            className="flex-1"
          >
            Mark {primaryNext}
          </Button>
        )}
        {order.status !== "CANCELED" && order.status !== "COMPLETED" && (
          <Button
            variant="danger"
            onClick={() => void dispatch(updateOrderStatusThunk({ id: order.id, status: "CANCELED" }))}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
