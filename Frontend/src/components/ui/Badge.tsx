import type { OrderStatus } from "../../types/api";
import pendingImg from "../../../public/assets/pending.svg";

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

// Icons only for the non-image statuses
const iconByStatus: Partial<Record<OrderStatus, string>> = {
  READY: "M5 13l4 4L19 7",
  COMPLETED: "M5 13l4 4L19 7",
  CANCELED: "M18 6L6 18M6 6l12 12",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const isImageStatus = status === "PENDING" || status === "PREPARING";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-bold ${styleByStatus[status]}`}>
      {/* Conditional Rendering: Show Image OR SVG */}
      {isImageStatus ? (
        <img
          src={pendingImg}
          alt=""
          className="h-3.5 w-3.5 shrink-0 object-contain"
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={iconByStatus[status]} />
        </svg>
      )}

      {labelByStatus[status]}
    </span>
  );
}