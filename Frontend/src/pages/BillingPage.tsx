import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Select } from "../components/ui/Select";
import {
  deletePaymentThunk,
  deletePendingOrderThunk,
  fetchBillingSummaryThunk,
  fetchPendingPaymentsThunk,
  fetchRecentPaymentsThunk,
  processPaymentThunk,
  setBillingPeriod,
  setPendingPage,
  setPendingSearch,
  setRecentPage,
  setRecentSearch,
} from "../features/billing/billingSlice";
import type { OrderStatus, PaymentMethod, PaymentStatus, PendingPaymentRow, RecentPaymentRow } from "../types/api";

type Tone = "green" | "orange" | "emerald" | "violet";

const formatCurrency = (value: number) =>
  `₹ ${new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const methodLabel: Record<PaymentMethod, string> = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  WALLET: "Wallet",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
};

const orderStatusLabel: Record<Extract<OrderStatus, "PENDING" | "PREPARING" | "READY" | "COMPLETED" | "CANCELED">, string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
};

function SortGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-[#222222]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 7 4-4 4 4" />
      <path d="m14 13-4 4-4-4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 text-[#7d766d]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 13H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 6h14" />
      <path d="M6 10h10a3 3 0 0 1 0 6H8" />
      <path d="M9 14h6" />
      <path d="M9 3v18" />
    </svg>
  );
}

function BillsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4h10v16H7z" />
      <path d="M9.5 8h5" />
      <path d="M9.5 12h5" />
      <path d="M9.5 16h3.2" />
    </svg>
  );
}

function PaidIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12.5 2.2 2.2L15.8 9.8" />
    </svg>
  );
}

function PaymentsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="16" height="10" rx="2" />
      <path d="M4 11h16" />
      <path d="M8 15h4" />
    </svg>
  );
}

function MetricCard({
  title,
  value,
  tone,
  icon,
}: {
  title: string;
  value: string;
  tone: Tone;
  icon: ReactNode;
}) {
  const toneClasses: Record<Tone, string> = {
    green: "text-[#16a34a] bg-[#ecf8ed]",
    orange: "text-[#ff8a2a] bg-[#fff1e3]",
    emerald: "text-[#22c55e] bg-[#e9f9ec]",
    violet: "text-[#8b5cf6] bg-[#f1eafe]",
  };

  return (
    <div className="rounded-[10px] border border-[#d8d1c7] bg-white px-4 py-4 shadow-[0_3px_12px_rgba(33,24,13,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-[#252525]">{title}</p>
          <p className="mt-2 text-[14px] font-semibold text-[#1d1d1d]">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${toneClasses[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function StatusPill({
  status,
}: {
  status: PendingPaymentRow["status"] | RecentPaymentRow["status"];
}) {
  const config: Record<string, string> = {
    PENDING: "bg-[#ffe0c8] text-[#8a5600]",
    PREPARING: "bg-[#e4f0ff] text-[#2c6fb3]",
    READY: "bg-[#dff8ff] text-[#1294c9]",
    COMPLETED: "bg-[#e5f8e5] text-[#1aab2a]",
    CANCELED: "bg-[#ffe1e1] text-[#cf4949]",
  };

  const label =
    status === "COMPLETED"
      ? paymentStatusLabel.COMPLETED
      : status === "PENDING"
        ? paymentStatusLabel.PENDING
        : orderStatusLabel[status as keyof typeof orderStatusLabel];

  return (
    <span className={`inline-flex min-w-[82px] items-center justify-center rounded-full px-4 py-2 text-[12px] font-medium ${config[status]}`}>
      {label}
    </span>
  );
}

function MethodPill({ method }: { method: PaymentMethod }) {
  return (
    <span className="inline-flex min-w-[96px] items-center justify-center rounded-full border border-[#bbb6ae] bg-white px-4 py-2 text-[12px] text-[#2f2e2d]">
      {methodLabel[method]}
    </span>
  );
}

function TableHeaderCell({
  children,
  checkbox,
  className,
}: {
  children?: ReactNode;
  checkbox?: boolean;
  className?: string;
}) {
  return (
    <th className={`border-b border-r border-[#d8dce2] bg-[#f5f6f8] px-4 py-4 text-left text-[12px] font-medium text-[#24292f] ${className ?? ""}`}>
      <div className={`flex items-center ${checkbox ? "justify-center" : "justify-between"} gap-2`}>
        {children ? <span>{children}</span> : null}
        {!checkbox ? <SortGlyph /> : null}
      </div>
    </th>
  );
}

function TableFooter({
  label,
  page,
  totalPages,
  onPageChange,
}: {
  label: string;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const pages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const visible = new Set<number>([1, 2, totalPages - 1, totalPages, page - 1, page, page + 1]);
    return Array.from(visible)
      .filter((item) => item >= 1 && item <= totalPages)
      .sort((a, b) => a - b)
      .flatMap((item, index, array) => {
        if (index === 0) return [item];
        const previous = array[index - 1];
        if (item - previous > 1) return ["ellipsis" as const, item];
        return [item];
      });
  }, [page, totalPages]);

  return (
    <div className="mt-6 flex flex-col gap-4 text-[12px] text-[#605a52] lg:flex-row lg:items-center lg:justify-between">
      <span>{label}</span>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-2 text-[#1f1f1f] transition disabled:cursor-not-allowed disabled:text-[#b7b0a5]"
        >
          <ArrowLeft />
          Previous
        </button>
        <div className="flex items-center gap-1.5">
          {pages.map((item, index) =>
            item === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="px-1 text-[#7d766d]">
                -
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-8 rounded-[6px] px-2 py-1 text-[12px] transition ${
                  item === page ? "bg-[#efcc94] text-[#1f1f1f]" : "text-[#5c564d] hover:bg-[#f4efe7]"
                }`}
              >
                {item}
              </button>
            )
          )}
        </div>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-2 text-[#1f1f1f] transition disabled:cursor-not-allowed disabled:text-[#b7b0a5]"
        >
          Next
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}

export function BillingPage() {
  const dispatch = useAppDispatch();
  const {
    summary,
    pendingRows,
    recentRows,
    pendingPagination,
    recentPagination,
    pendingSearch,
    recentSearch,
    period,
    error,
    mutating,
  } = useAppSelector((state) => state.billing);

  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);
  const [selectedRecentIds, setSelectedRecentIds] = useState<string[]>([]);
  const [paymentTarget, setPaymentTarget] = useState<PendingPaymentRow | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");

  useEffect(() => {
    void dispatch(fetchBillingSummaryThunk(period));
  }, [dispatch, period]);

  useEffect(() => {
    void dispatch(
      fetchPendingPaymentsThunk({
        period,
        search: pendingSearch,
        page: pendingPagination.page,
        limit: pendingPagination.limit,
      })
    );
  }, [dispatch, pendingPagination.limit, pendingPagination.page, pendingSearch, period]);

  useEffect(() => {
    void dispatch(
      fetchRecentPaymentsThunk({
        period,
        search: recentSearch,
        page: recentPagination.page,
        limit: recentPagination.limit,
      })
    );
  }, [dispatch, period, recentPagination.limit, recentPagination.page, recentSearch]);

  const visiblePendingIds = useMemo(
    () => selectedPendingIds.filter((id) => pendingRows.some((row) => row.id === id)),
    [pendingRows, selectedPendingIds]
  );
  const visibleRecentIds = useMemo(
    () => selectedRecentIds.filter((id) => recentRows.some((row) => row.id === id)),
    [recentRows, selectedRecentIds]
  );

  const pendingAllSelected = pendingRows.length > 0 && pendingRows.every((row) => visiblePendingIds.includes(row.id));
  const recentAllSelected = recentRows.length > 0 && recentRows.every((row) => visibleRecentIds.includes(row.id));

  const refreshBilling = async () => {
    await dispatch(fetchBillingSummaryThunk(period));
    await dispatch(
      fetchPendingPaymentsThunk({
        period,
        search: pendingSearch,
        page: pendingPagination.page,
        limit: pendingPagination.limit,
      })
    );
    await dispatch(
      fetchRecentPaymentsThunk({
        period,
        search: recentSearch,
        page: recentPagination.page,
        limit: recentPagination.limit,
      })
    );
  };

  const deleteSelectedPending = async () => {
    for (const id of visiblePendingIds) {
      await dispatch(deletePendingOrderThunk(id));
    }
    setSelectedPendingIds([]);
    await refreshBilling();
  };

  const deleteSelectedRecent = async () => {
    for (const id of visibleRecentIds) {
      await dispatch(deletePaymentThunk(id));
    }
    setSelectedRecentIds([]);
    await refreshBilling();
  };

  const handleConfirmPayment = async () => {
    if (!paymentTarget) return;
    const result = await dispatch(processPaymentThunk({ orderId: paymentTarget.id, method: paymentMethod }));
    if (processPaymentThunk.fulfilled.match(result)) {
      setPaymentTarget(null);
      setPaymentMethod("CASH");
      await refreshBilling();
    }
  };

  const pendingLabel = useMemo(() => {
    if (pendingPagination.total === 0) return "Showing 0 Out of 0";
    const start = (pendingPagination.page - 1) * pendingPagination.limit + 1;
    const end = Math.min(start + pendingRows.length - 1, pendingPagination.total);
    return `Showing ${start}-${end} Out of ${pendingPagination.total}`;
  }, [pendingPagination.limit, pendingPagination.page, pendingPagination.total, pendingRows.length]);

  const recentLabel = useMemo(() => {
    if (recentPagination.total === 0) return "Showing 0 Out of 0";
    const start = (recentPagination.page - 1) * recentPagination.limit + 1;
    const end = Math.min(start + recentRows.length - 1, recentPagination.total);
    return `Showing ${start}-${end} Out of ${recentPagination.total}`;
  }, [recentPagination.limit, recentPagination.page, recentPagination.total, recentRows.length]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Billing & Payments"
        subtitle="Manage payments and generate bills"
        action={
          <Select
            className="!h-9 !w-[108px] !rounded-[4px] !border-[#d7d7d7] !bg-white px-3 text-[12px]"
            style={{ width: "108px", minWidth: "108px", maxWidth: "108px" }}
            value={period}
            onChange={(event) => dispatch(setBillingPeriod(event.target.value as typeof period))}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        }
      />

      {error ? (
        <div className="rounded-[12px] border border-[#f0c1c1] bg-[#fff6f6] px-4 py-3 text-[13px] text-[#b64646]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today's Revenue" value={formatCurrency(summary?.todaysRevenue ?? 0)} tone="green" icon={<RevenueIcon />} />
        <MetricCard title="Unpaid Bills" value={`${summary?.unpaidBills ?? 0}`} tone="orange" icon={<BillsIcon />} />
        <MetricCard title="Paid Today" value={`${summary?.paidToday ?? 0}`} tone="emerald" icon={<PaidIcon />} />
        <MetricCard title="Total Payments" value={`${summary?.totalPayments ?? 0}`} tone="violet" icon={<PaymentsIcon />} />
      </section>

      <section className="rounded-[16px] bg-white px-6 py-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-[18px] font-medium text-[#111111]">Pending Payments ({pendingRows.length})</h2>
          </div>
          <button
            type="button"
            disabled={visiblePendingIds.length === 0 || mutating}
            onClick={() => void deleteSelectedPending()}
            className="inline-flex h-11 min-w-[176px] items-center justify-center gap-3 rounded-[6px] border border-[#ff4f4f] bg-white px-5 text-[15px] font-medium text-[#ff3f3f] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TrashIcon />
            Delete
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-11 w-full max-w-[520px] items-center rounded-[8px] border border-[#d0d0d0] bg-white px-4 text-[#7d766d]">
            <SearchIcon />
            <Input
              value={pendingSearch}
              onChange={(event) => dispatch(setPendingSearch(event.target.value))}
              placeholder="Search by name , phone"
              className="h-full border-0 bg-transparent px-4 text-[14px] placeholder:text-[#8f8a82] focus:bg-transparent"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-[#d8dce2]">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] table-fixed border-collapse text-left">
              <thead>
                <tr>
                  <TableHeaderCell checkbox className="w-[48px] px-2">
                    <input
                      type="checkbox"
                      checked={pendingAllSelected}
                      onChange={() => setSelectedPendingIds(pendingAllSelected ? [] : pendingRows.map((row) => row.id))}
                      className="h-5 w-5 rounded-[4px] border-[#8e9bb0] text-[#2f4b6a]"
                    />
                  </TableHeaderCell>
                  <TableHeaderCell className="w-[170px]">Order</TableHeaderCell>
                  <TableHeaderCell className="w-[215px]">Customer</TableHeaderCell>
                  <TableHeaderCell className="w-[135px]">Table</TableHeaderCell>
                  <TableHeaderCell className="w-[150px]">Items</TableHeaderCell>
                  <TableHeaderCell className="w-[155px]">Amount</TableHeaderCell>
                  <TableHeaderCell className="w-[150px]">Status</TableHeaderCell>
                  <TableHeaderCell className="w-[157px] text-center">Action</TableHeaderCell>
                </tr>
              </thead>
              <tbody className="bg-white text-[13px] text-[#353535]">
                {pendingRows.map((row) => (
                  <tr key={row.id} className="h-[60px] transition hover:bg-[#fcfcfd]">
                    <td className="border-b border-r border-[#d8dce2] px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={visiblePendingIds.includes(row.id)}
                        onChange={() =>
                          setSelectedPendingIds((current) =>
                            current.includes(row.id)
                              ? current.filter((item) => item !== row.id)
                              : [...current, row.id]
                          )
                        }
                        className="h-5 w-5 rounded-[4px] border-[#8e9bb0] text-[#2f4b6a]"
                      />
                    </td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3 font-medium text-[#2a2f36]">{row.order}</td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3 text-[#383838]">{row.customer}</td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3">{row.table}</td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3">{row.items} items</td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3 font-semibold text-[#19b91f]">{formatCurrency(row.amount)}</td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="border-b border-[#d8dce2] px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setPaymentTarget(row)}
                        className="inline-flex h-10 min-w-[102px] items-center justify-center rounded-[8px] bg-[#9b7b48] px-5 text-[13px] font-medium text-white transition hover:bg-[#8a6c3e]"
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}

                {pendingRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-[13px] text-[#857f76]">
                      No pending payments found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <TableFooter
          label={pendingLabel}
          page={pendingPagination.page}
          totalPages={pendingPagination.totalPages}
          onPageChange={(page) => dispatch(setPendingPage(page))}
        />
      </section>

      <section className="rounded-[16px] bg-white px-6 py-6 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-[18px] font-medium text-[#111111]">Recent Payments</h2>
          </div>
          <button
            type="button"
            disabled={visibleRecentIds.length === 0 || mutating}
            onClick={() => void deleteSelectedRecent()}
            className="inline-flex h-11 min-w-[176px] items-center justify-center gap-3 rounded-[6px] border border-[#ff4f4f] bg-white px-5 text-[15px] font-medium text-[#ff3f3f] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <TrashIcon />
            Delete
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex h-11 w-full max-w-[520px] items-center rounded-[8px] border border-[#d0d0d0] bg-white px-4 text-[#7d766d]">
            <SearchIcon />
            <Input
              value={recentSearch}
              onChange={(event) => dispatch(setRecentSearch(event.target.value))}
              placeholder="Search by name , phone"
              className="h-full border-0 bg-transparent px-4 text-[14px] placeholder:text-[#8f8a82] focus:bg-transparent"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-[8px] border border-[#d8dce2]">
          <div className="overflow-x-auto">
            <table className="min-w-[1180px] table-fixed border-collapse text-left">
              <thead>
                <tr>
                  <TableHeaderCell checkbox className="w-[48px] px-2">
                    <input
                      type="checkbox"
                      checked={recentAllSelected}
                      onChange={() => setSelectedRecentIds(recentAllSelected ? [] : recentRows.map((row) => row.id))}
                      className="h-5 w-5 rounded-[4px] border-[#8e9bb0] text-[#2f4b6a]"
                    />
                  </TableHeaderCell>
                  <TableHeaderCell className="w-[170px]">Payment ID</TableHeaderCell>
                  <TableHeaderCell className="w-[200px]">Order</TableHeaderCell>
                  <TableHeaderCell className="w-[155px]">Amount</TableHeaderCell>
                  <TableHeaderCell className="w-[180px]">Method</TableHeaderCell>
                  <TableHeaderCell className="w-[260px]">Date</TableHeaderCell>
                  <TableHeaderCell className="w-[147px]">Status</TableHeaderCell>
                </tr>
              </thead>
              <tbody className="bg-white text-[13px] text-[#353535]">
                {recentRows.map((row) => (
                  <tr key={row.id} className="h-[60px] transition hover:bg-[#fcfcfd]">
                    <td className="border-b border-r border-[#d8dce2] px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={visibleRecentIds.includes(row.id)}
                        onChange={() =>
                          setSelectedRecentIds((current) =>
                            current.includes(row.id)
                              ? current.filter((item) => item !== row.id)
                              : [...current, row.id]
                          )
                        }
                        className="h-5 w-5 rounded-[4px] border-[#8e9bb0] text-[#2f4b6a]"
                      />
                    </td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3 font-medium text-[#2a2f36]">{row.paymentId}</td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3 text-[#383838]">{row.order}</td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3 font-semibold text-[#19b91f]">{formatCurrency(row.amount)}</td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3">
                      <MethodPill method={row.method} />
                    </td>
                    <td className="border-b border-r border-[#d8dce2] px-4 py-3 text-[#383838]">{formatDateTime(row.date)}</td>
                    <td className="border-b border-[#d8dce2] px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                  </tr>
                ))}

                {recentRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#857f76]">
                      No recent payments found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <TableFooter
          label={recentLabel}
          page={recentPagination.page}
          totalPages={recentPagination.totalPages}
          onPageChange={(page) => dispatch(setRecentPage(page))}
        />
      </section>

      <Modal open={Boolean(paymentTarget)} onClose={() => setPaymentTarget(null)} title="Process Payment">
        {paymentTarget ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#e8e0d5] bg-[#fcfbf8]">
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 px-4 py-5 text-[14px]">
                <span className="text-[#8a847d]">Order #</span>
                <span className="text-right font-medium">{paymentTarget.order}</span>
                <span className="text-[#8a847d]">Customer</span>
                <span className="text-right font-medium">{paymentTarget.customer}</span>
                <span className="text-[#8a847d]">Total Amount</span>
                <span className="text-right text-[20px] font-semibold text-[#18a34a]">{formatCurrency(paymentTarget.amount)}</span>
              </div>
            </div>

            <div>
              <p className="mb-3 text-[14px] font-medium text-[#1f1f1f]">Payment Method</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {(Object.keys(methodLabel) as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`rounded-xl border px-4 py-4 text-[15px] font-semibold transition ${
                      paymentMethod === method
                        ? "border-brand-300 bg-brand-100 text-brand-700"
                        : "border-[#ddd6ca] bg-white text-[#2d2a26] hover:bg-[#fbf8f1]"
                    }`}
                  >
                    {methodLabel[method]}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="danger" className="h-11 px-8" onClick={() => setPaymentTarget(null)}>
                Cancel
              </Button>
              <Button
                className="h-11 bg-[#1daf2c] hover:border-[#179322] hover:bg-[#179322]"
                disabled={mutating}
                onClick={() => void handleConfirmPayment()}
              >
                Confirm Payment
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
