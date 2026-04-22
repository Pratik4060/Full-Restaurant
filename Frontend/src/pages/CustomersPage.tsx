import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { MetricCard } from "../components/dashboard/MetricCard";
import { PageHeader } from "../components/layout/PageHeader";
import { Button } from "../components/ui/Button";
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

const formatDate = (value: string | null) => {
  if (!value) return "No visits yet";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

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
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
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
    if (pagination.total === 0) return "Showing 0 customers";
    const start = (pagination.page - 1) * pagination.limit + 1;
    const end = Math.min(start + rows.length - 1, pagination.total);
    return `Showing ${start}-${end} of ${pagination.total} customers`;
  }, [pagination.limit, pagination.page, pagination.total, rows.length]);

  return (
    <div className="space-y-5">
      <PageHeader title="Customers" subtitle="Manage customer information and spending history" />

      <div className="flex justify-end">
        <Select
          className="w-[140px] bg-white"
          value={period}
          onChange={(event) => dispatch(setCustomersPeriod(event.target.value as typeof period))}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </Select>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Customers" value={`${summary?.totalCustomers ?? 0}`} note="Tracked guests" />
        <MetricCard title="Total Orders" value={`${summary?.totalOrders ?? 0}`} note="For selected period" />
        <MetricCard title="Total Revenue" value={formatCurrency(summary?.totalRevenue ?? 0)} note="Completed orders only" />
        <MetricCard
          title="Avg. Order Value"
          value={formatCurrency(summary?.averageOrderValue ?? 0)}
          note="Average completed order"
        />
      </section>

      <section className="rounded-[28px] border border-[#e9e0d4] bg-white p-5 shadow-[0_18px_50px_rgba(52,39,21,0.06)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="w-full max-w-[380px]">
            <Input
              value={search}
              onChange={(event) => dispatch(setCustomersSearch(event.target.value))}
              placeholder="Search by name or phone"
              className="bg-white"
            />
          </div>
          <Button
            variant="danger"
            disabled={selectedCount === 0 || deleting}
            onClick={() => void handleDeleteSelected()}
          >
            Delete {selectedCount > 0 ? `(${selectedCount})` : ""}
          </Button>
        </div>

        <div className="mt-5 overflow-hidden rounded-[20px] border border-[#e7dfd4]">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead className="bg-[#fbfaf8] text-[12px] font-semibold text-[#5d584f]">
                <tr>
                  <th className="w-12 border-b border-[#e7dfd4] px-4 py-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() =>
                        setSelectedIds(allSelected ? [] : rows.map((row) => row.id))
                      }
                    />
                  </th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Customer Name</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Contact</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Guests</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Table</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Orders</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Total Spent</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4">Last Visit</th>
                  <th className="border-b border-[#e7dfd4] px-4 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white text-[13px] text-[#2b2b2b]">
                {rows.map((row) => (
                  <tr key={row.id} className="transition hover:bg-[#fcfaf6]">
                    <td className="border-b border-[#eee6da] px-4 py-4">
                      <input
                        type="checkbox"
                        checked={visibleSelectedIds.includes(row.id)}
                        onChange={() => toggleSelected(row.id)}
                      />
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4 font-medium">{row.customerName}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4 text-[#6f6a63]">{row.contactNumber ?? "N/A"}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{row.numberOfGuest}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{row.tableNumber ?? "-"}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{row.numberOfOrders} orders</td>
                    <td className="border-b border-[#eee6da] px-4 py-4 font-semibold text-[#18a34a]">
                      {formatCurrency(row.totalSpent)}
                    </td>
                    <td className="border-b border-[#eee6da] px-4 py-4">{formatDate(row.lastVisit)}</td>
                    <td className="border-b border-[#eee6da] px-4 py-4 text-right">
                      <button
                        className="rounded-xl border border-[#f1d9d9] px-3 py-2 text-[12px] font-medium text-[#d55d5d] transition hover:bg-[#fff5f5]"
                        onClick={() => void handleDeleteSingle(row.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-[13px] text-[#857f76]">
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
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={(page) => dispatch(setCustomersPage(page))}
          />
        </div>
      </section>
    </div>
  );
}
