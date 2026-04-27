import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { MetricCard } from "../components/dashboard/MetricCard";
import { PageHeader } from "../components/layout/PageHeader";
import { Input } from "../components/ui/Input";
import { Pagination } from "../components/ui/Pagination";
import { Select } from "../components/ui/Select";
import {
  deleteCustomerThunk,
  deleteCustomersThunk,
  fetchCustomersSummaryThunk,
  fetchCustomersTableThunk,
  setCustomersPage,
  setCustomersPeriod,
  setCustomersSearch,
} from "../features/customers/customersSlice";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);

const formatDateOnly = (value: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "numeric", year: "numeric" }).format(new Date(value));
};

const formatRelative = (value: string | null) => {
  if (!value) return "";
  const diffMs = Date.now() - new Date(value).getTime();
  const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  if (diffDays <= 0) return "today";
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
};

const SortIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[#111111]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m8 8 4-4 4 4" />
    <path d="m16 16-4 4-4-4" />
  </svg>
);

export function CustomersPage() {
  const dispatch = useAppDispatch();
  const { summary, rows, pagination, period, search, loading, deleting } = useAppSelector((state) => state.customers);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    void dispatch(fetchCustomersSummaryThunk(period));
  }, [dispatch, period]);

  useEffect(() => {
    void dispatch(
      fetchCustomersTableThunk({
        period,
        search,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  }, [dispatch, pagination.limit, pagination.page, period, search]);

  const visibleSelectedIds = useMemo(
    () => selectedIds.filter((id) => rows.some((row) => row.id === id)),
    [rows, selectedIds]
  );
  const allSelected = rows.length > 0 && rows.every((row) => visibleSelectedIds.includes(row.id));
  const selectedCount = visibleSelectedIds.length;

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleDeleteSelected = async () => {
    if (visibleSelectedIds.length === 0) return;
    if (visibleSelectedIds.length === 1) {
      await dispatch(deleteCustomerThunk(visibleSelectedIds[0]));
    } else {
      await dispatch(deleteCustomersThunk(visibleSelectedIds));
    }
    await dispatch(fetchCustomersSummaryThunk(period));
    await dispatch(
      fetchCustomersTableThunk({
        period,
        search,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  };

  const handleDeleteSingle = async (id: string) => {
    await dispatch(deleteCustomerThunk(id));
    await dispatch(fetchCustomersSummaryThunk(period));
    await dispatch(
      fetchCustomersTableThunk({
        period,
        search,
        page: pagination.page,
        limit: pagination.limit,
      })
    );
  };

  const showingLabel = useMemo(() => {
    if (pagination.total === 0) return "Showing 0 out of 0";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + rows.length - 1, pagination.total);
    return `Showing ${start}-${end} Out of ${pagination.total}`;
  }, [pagination.limit, pagination.page, pagination.total, rows.length]);

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <PageHeader title="Customers" subtitle="Manage customer information" />

      <div className="flex justify-start sm:justify-end">
        <div className="relative w-full max-w-[132px]">
          <Select
            className="h-10 appearance-none rounded-[6px] border-[#d6cec0] bg-white px-3 pr-9 text-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:h-8"
            value={period}
            onChange={(event) => dispatch(setCustomersPeriod(event.target.value as typeof period))}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#59534b]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>

      <section className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Customers" value={`${summary?.totalCustomers ?? 0}`} note=" " />
        <MetricCard title="Total Orders" value={`${summary?.totalOrders ?? 0}`} note=" " />
        <MetricCard title="Total Revenue" value={formatCurrency(summary?.totalRevenue ?? 0)} note=" " />
        <MetricCard title="Avg. Order Value" value={formatCurrency(summary?.averageOrderValue ?? 0)} note=" " />
      </section>

      <section className="rounded-[12px] border border-[#e7e0d7] bg-white px-3 py-3 shadow-[0_8px_24px_rgba(44,33,18,0.04)] sm:px-4 sm:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="flex h-11 w-full items-center rounded-[6px] border border-[#d5d1ca] bg-white px-3 md:max-w-[560px]">
            <svg
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4 shrink-0 text-[#7a746b]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <Input
              value={search}
              onChange={(event) => dispatch(setCustomersSearch(event.target.value))}
              placeholder="Search by name, phone"
              className="h-full border-0 bg-transparent px-0 text-[13px] placeholder:text-[#8f8981] focus:border-0 focus:bg-transparent"
            />
          </label>

          <button
            type="button"
            disabled={selectedCount === 0 || deleting}
            onClick={() => void handleDeleteSelected()}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[6px] border border-[#ff5858] px-5 text-[13px] font-medium text-[#ff4d4d] transition hover:bg-[#fff5f5] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6l-1 13H6L5 6" />
              <path d="M10 11v5" />
              <path d="M14 11v5" />
            </svg>
            Delete
          </button>
        </div>

        <div className="mt-4 max-w-full overflow-hidden rounded-[6px] border border-[#d6dce3]">
          <div className="max-w-full overflow-x-auto">
            <table className="min-w-[980px] border-collapse text-left">
              <thead className="bg-[#f7f8fb] text-[12px] font-medium text-[#2a2a2a]">
                <tr>
                  <th className="w-14 border-b border-r border-[#d6dce3] px-4 py-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => setSelectedIds(allSelected ? [] : rows.map((row) => row.id))}
                      className="h-4 w-4 accent-[#2f4b6a]"
                    />
                  </th>
                  <th className="border-b border-r border-[#d6dce3] px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span>Customer Name</span>
                      <SortIcon />
                    </div>
                  </th>
                  <th className="border-b border-r border-[#d6dce3] px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span>Contact</span>
                      <SortIcon />
                    </div>
                  </th>
                  <th className="border-b border-r border-[#d6dce3] px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span>Number of Guests</span>
                      <SortIcon />
                    </div>
                  </th>
                  <th className="border-b border-r border-[#d6dce3] px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span>Table Number</span>
                      <SortIcon />
                    </div>
                  </th>
                  <th className="border-b border-r border-[#d6dce3] px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span>Number of Orders</span>
                      <SortIcon />
                    </div>
                  </th>
                  <th className="border-b border-r border-[#d6dce3] px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span>Total Spent</span>
                      <SortIcon />
                    </div>
                  </th>
                  <th className="border-b border-r border-[#d6dce3] px-4 py-4">
                    <div className="flex items-center justify-between gap-2">
                      <span>Last Visit</span>
                      <SortIcon />
                    </div>
                  </th>
                  <th className="border-b border-[#d6dce3] px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-white text-[13px] text-[#2b2b2b]">
                {rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[#fcfaf6]">
                    <td className="border-b border-r border-[#d6dce3] px-4 py-5">
                      <input
                        type="checkbox"
                        checked={visibleSelectedIds.includes(row.id)}
                        onChange={() => toggleSelected(row.id)}
                        className="h-4 w-4 accent-[#2f4b6a]"
                      />
                    </td>
                    <td className="border-b border-r border-[#d6dce3] px-4 py-5 font-medium">{row.customerName}</td>
                    <td className="border-b border-r border-[#d6dce3] px-4 py-5 text-[#3d3d3d]">{row.contactNumber ?? "N/A"}</td>
                    <td className="border-b border-r border-[#d6dce3] px-4 py-5">{row.numberOfGuest}</td>
                    <td className="border-b border-r border-[#d6dce3] px-4 py-5">{row.tableNumber ?? "-"}</td>
                    <td className="border-b border-r border-[#d6dce3] px-4 py-5">{row.numberOfOrders} orders</td>
                    <td className="border-b border-r border-[#d6dce3] px-4 py-5 font-semibold text-[#18a34a]">
                      {formatCurrency(row.totalSpent)}
                    </td>
                    <td className="border-b border-r border-[#d6dce3] px-4 py-5">
                      <div className="leading-5">
                        <p className="text-[#1f1f1f]">{formatDateOnly(row.lastVisit)}</p>
                        <p className="text-[11px] text-[#8c8c8c]">{formatRelative(row.lastVisit)}</p>
                      </div>
                    </td>
                    <td className="border-b border-[#d6dce3] px-4 py-5 text-center">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] bg-[#f5f7fa] text-[#ff4d6d] transition hover:bg-[#eef2f7]"
                        onClick={() => void handleDeleteSingle(row.id)}
                        aria-label="Delete customer"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 13H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-[#857f76]">
                      No customers found for the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 text-[12px] text-[#7e786f] md:flex-row md:items-center md:justify-between">
          <span>{showingLabel}</span>
          <div className="overflow-x-auto">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={(page) => dispatch(setCustomersPage(page))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
