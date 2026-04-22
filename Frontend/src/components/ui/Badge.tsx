import type { OrderStatus } from "../../types/api";

const styleByStatus: Record<OrderStatus, string> = {
  PENDING: "bg-[#fff1e6] text-[#c96f2d]",
  PREPARING: "bg-[#fff8d9] text-[#a98400]",
  READY: "bg-[#e3f7ff] text-[#2788aa]",
  COMPLETED: "bg-[#e6f7e7] text-[#3f9a4d]",
  CANCELED: "bg-[#ffe6e6] text-[#d45d5d]",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${styleByStatus[status]}`}>
      {status}
    </span>
  );
}
