import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { MetricCard } from "../components/dashboard/MetricCard";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Pagination } from "../components/ui/Pagination";
import { Select } from "../components/ui/Select";
import { StatusBadge } from "../components/ui/Badge";
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
import type { PaymentMethod, PendingPaymentRow } from "../types/api";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "2-digit",
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
    await refreshBilling();
  };

  const deleteSelectedRecent = async () => {
    for (const id of visibleRecentIds) {
      await dispatch(deletePaymentThunk(id));
    }
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
    if (pendingPagination.total === 0) return "Showing 0 pending payments";
    const start = (pendingPagination.page - 1) * pendingPagination.limit + 1;
    const end = Math.min(start + pendingRows.length - 1, pendingPagination.total);
    return `Showing ${start}-${end} of ${pendingPagination.total} pending bills`;
  }, [pendingPagination.limit, pendingPagination.page, pendingPagination.total, pendingRows.length]);

  const recentLabel = useMemo(() => {
    if (recentPagination.total === 0) return "Showing 0 payments";
    const start = (recentPagination.page - 1) * recentPagination.limit + 1;
    const end = Math.min(start + recentRows.length - 1, recentPagination.total);
    return `Showing ${start}-${end} of ${recentPagination.total} payments`;
  }, [recentPagination.limit, recentPagination.page, recentPagination.total, recentRows.length]);

  return (
    <div className="space-y-5">
      <PageHeader title="Billing & Payments" subtitle="Manage unpaid bills, payments, and collection flow" />

      <div className="flex justify-end">
        <Select
          className="w-[140px] bg-white"
          value={period}
          onChange={(event) => dispatch(setBillingPeriod(event.target.value as typeof period))}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </Select>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today's Revenue" value={formatCurrency(summary?.todaysRevenue ?? 0)} note="Collected today" />
        <MetricCard title="Unpaid Bills" value={`${summary?.unpaidBills ?? 0}`} note="Awaiting payment" />
        <MetricCard title="Paid Today" value={`${summary?.paidToday ?? 0}`} note="Completed transactions" />
        <MetricCard title="Total Payments" value={`${summary?.totalPayments ?? 0}`} note="For selected period" />
      </section>

      <section className="rounded-[28px] border border-[#e9e0d4] bg-white p-5 shadow-[0_18px_50px_rgba(52,39,21,0.06)]">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[18px] font-semibold text-[#1f1f1f]">Pending Payments</h2>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={pendingSearch}
              onChange={(event) => dispatch(setPendingSearch(event.target.value))}
              placeholder="Search by order, customer, phone"
              className="w-full md:w-[320px] bg-white"
            />
            <Button
              variant="danger"
              disabled={visiblePendingIds.length === 0 || mutating}
              onClick={() => void deleteSelectedPending()}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[#e7dfd4]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#fbfaf8] text-[12px] font-semibold text-[#5d584f]">
                <tr>
                  <th className="w-12 border-b border-[#e7dfd4] px-4 py-4">
                    <input
                      type="checkbox"
                      checked={pendingRows.length > 0 && pendingRows.every((row) => visiblePendingIds.includes(row.id))}
                      onChange={() =>
                        setSelectedPendingIds(
                          pendingRows.every((row) => visiblePendingIds.includes(row.id))
                            ? []
                            : pendingRows.map((row) => row.id)
                        )
                      }
                    />
                  </th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Order</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Customer</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Table</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Items</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Amount</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Status</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white text-[13px] text-[#2b2b2b]">
                {pendingRows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[#fcfaf6]">
                    <td className="border-b border-[#eee6da] px-4 py-4">
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
                      />
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4 font-medium">{row.order}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{row.customer}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{row.table}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{row.items} items</td>
                    <td className="border-b border-[#eee6da] px-4 py-4 font-semibold text-[#18a34a]">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4 text-right">
                      <Button className="bg-brand-600" onClick={() => setPaymentTarget(row)}>
                        Pay Now
                      </Button>
                    </td>
                  </tr>
                ))}
                {pendingRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-[13px] text-[#857f76]">
                      No pending payments found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[12px] text-[#7e786f] md:flex-row md:items-center md:justify-between">
          <span>{pendingLabel}</span>
          <Pagination
            page={pendingPagination.page}
            totalPages={pendingPagination.totalPages}
            onChange={(page) => dispatch(setPendingPage(page))}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-[#e9e0d4] bg-white p-5 shadow-[0_18px_50px_rgba(52,39,21,0.06)]">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[18px] font-semibold text-[#1f1f1f]">Recent Payments</h2>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={recentSearch}
              onChange={(event) => dispatch(setRecentSearch(event.target.value))}
              placeholder="Search by payment, order, customer"
              className="w-full md:w-[320px] bg-white"
            />
            <Button
              variant="danger"
              disabled={visibleRecentIds.length === 0 || mutating}
              onClick={() => void deleteSelectedRecent()}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-[#e7dfd4]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#fbfaf8] text-[12px] font-semibold text-[#5d584f]">
                <tr>
                  <th className="w-12 border-b border-[#e7dfd4] px-4 py-4">
                    <input
                      type="checkbox"
                      checked={recentRows.length > 0 && recentRows.every((row) => visibleRecentIds.includes(row.id))}
                      onChange={() =>
                        setSelectedRecentIds(
                          recentRows.every((row) => visibleRecentIds.includes(row.id))
                            ? []
                            : recentRows.map((row) => row.id)
                        )
                      }
                    />
                  </th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Payment ID</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Order</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Amount</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Method</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Date</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white text-[13px] text-[#2b2b2b]">
                {recentRows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[#fcfaf6]">
                    <td className="border-b border-[#eee6da] px-4 py-4">
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
                      />
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4 font-medium">{row.paymentId}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{row.order}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4 font-semibold text-[#18a34a]">
                      {formatCurrency(row.amount)}
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4">
                      <span className="inline-flex rounded-full border border-[#ddd4c7] px-4 py-1 text-[12px] text-[#5c584f]">
                        {methodLabel[row.method]}
                      </span>
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{formatDateTime(row.date)}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">
                      <span className="inline-flex rounded-full bg-[#e7f8ea] px-4 py-1 text-[12px] font-semibold text-[#35a14d]">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
                {recentRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#857f76]">
                      No recent payments found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[12px] text-[#7e786f] md:flex-row md:items-center md:justify-between">
          <span>{recentLabel}</span>
          <Pagination
            page={recentPagination.page}
            totalPages={recentPagination.totalPages}
            onChange={(page) => dispatch(setRecentPage(page))}
          />
        </div>
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
                <span className="text-right text-[20px] font-semibold text-[#18a34a]">
                  {formatCurrency(paymentTarget.amount)}
                </span>
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
