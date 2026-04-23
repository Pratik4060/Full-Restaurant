import type { OrderStatus } from "../../types/api";

const styleByStatus: Record<OrderStatus, string> = {
  PENDING: "bg-[#ffc28f] text-[#1f1f1f]",
  PREPARING: "bg-[#f7ef7d] text-[#1f1f1f]",
  READY: "bg-[#86ddf6] text-[#1f1f1f]",
  COMPLETED: "bg-[#47e04f] text-[#1f1f1f]",
  CANCELED: "bg-[#ff9a9a] text-[#1f1f1f]",
};

const labelByStatus: Record<OrderStatus, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
};

const iconByStatus: Record<OrderStatus, string> = {
  PENDING: "M12 7v5l3 2",
  PREPARING: "M12 6v6l4 2",
  READY: "M7 12l3 3 7-7",
  COMPLETED: "M7 12l3 3 7-7",
  CANCELED: "M8 8l8 8M16 8l-8 8",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium ${styleByStatus[status]}`}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d={iconByStatus[status]} />
      </svg>
      {labelByStatus[status]}
    </span>
  );
}
