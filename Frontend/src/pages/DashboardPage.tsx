import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { MetricCard } from "../components/dashboard/MetricCard";
import { PageHeader } from "../components/layout/PageHeader";
import { Select } from "../components/ui/Select";
import { fetchDashboardThunk, setRevenuePeriod } from "../features/dashboard/dashboardSlice";
import type { OrderStatusPoint, RevenuePeriod } from "../types/api";

const statusColors: Record<OrderStatusPoint["status"], string> = {
  PENDING: "#f8a095",
  PREPARING: "#c7a1f4",
  READY: "#90ed97",
  COMPLETED: "#8dbef2",
};

const statusLabels: Record<OrderStatusPoint["status"], string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
};

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { summary, revenue, revenuePeriod, orderStatus, activeOffers, popularItems } = useAppSelector((s) => s.dashboard);

  useEffect(() => {
    void dispatch(fetchDashboardThunk(revenuePeriod));
  }, [dispatch, revenuePeriod]);

  const maxRevenue = useMemo(
    () => Math.max(...(revenue?.points.map((point) => point.revenue) ?? [1])),
    [revenue]
  );

  const totalStatuses = useMemo(
    () => orderStatus.reduce((sum, item) => sum + item.count, 0),
    [orderStatus]
  );

  const conicStops = useMemo(() => {
    if (totalStatuses === 0) {
      return "conic-gradient(#f3ece1 0 100%)";
    }

    let cursor = 0;
    const segments = orderStatus.map((item) => {
      const start = cursor;
      const width = (item.count / totalStatuses) * 100;
      cursor += width;
      return `${statusColors[item.status]} ${start}% ${cursor}%`;
    });

    return `conic-gradient(${segments.join(",")})`;
  }, [orderStatus, totalStatuses]);

  const popularRows = useMemo(
    () => [
      ...(popularItems?.veg ?? []).slice(0, 2),
      ...(popularItems?.nonVeg ?? []).slice(0, 2),
      ...(popularItems?.beverages ?? []).slice(0, 1),
    ].slice(0, 5),
    [popularItems]
  );

  const pendingCount = orderStatus.find((item) => item.status === "PENDING")?.count ?? 0;
  const completedCount = orderStatus.find((item) => item.status === "COMPLETED")?.count ?? 0;

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle="Welcome back, Admin User" />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Today's Orders" value={`${summary?.todaysOrders ?? 0}`} note={`${completedCount} completed`} />
        <MetricCard title="Today's Revenue" value={`Rs. ${summary?.todaysRevenue ?? 0}`} note={`${revenue?.points.length ?? 0} points`} />
        <MetricCard title="Pending Orders" value={`${summary?.pendingOrders ?? 0}`} note={`${pendingCount} awaiting action`} />
        <MetricCard title="Total Customers" value={`${summary?.totalCustomers ?? 0}`} note="Live customer records" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="rounded-xl border border-[#e6ddd0] bg-white p-4 shadow-[0_4px_12px_rgba(44,33,18,0.04)]">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[12px] font-semibold text-[#2b2b2b]">Revenue</p>
            <Select
              value={revenuePeriod}
              onChange={(e) => dispatch(setRevenuePeriod(e.target.value as RevenuePeriod))}
              className="max-w-28"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
          <div className="rounded-lg border border-[#f0e9df] bg-[#fffdf9] p-4">
            <div className="flex h-[210px] items-end gap-4 border-b border-l border-[#efe8dd] px-3 pb-2 pt-4">
              {(revenue?.points ?? []).map((point) => {
                const ratio = maxRevenue > 0 ? point.revenue / maxRevenue : 0;
                return (
                  <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-2">
                    <div
                      className="w-full border-t border-[#f29c65]"
                      style={{ height: `${Math.max(18, ratio * 168)}px` }}
                    />
                    <span className="text-[10px] text-[#8a847d]">{point.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e6ddd0] bg-white p-4 shadow-[0_4px_12px_rgba(44,33,18,0.04)]">
          <p className="mb-3 text-[12px] font-semibold text-[#2b2b2b]">Orders by Status</p>
          <div className="flex h-[244px] items-center justify-center rounded-lg border border-[#f0e9df] bg-[#fffdf9]">
            <div className="relative h-44 w-44 rounded-full" style={{ background: conicStops }}>
              <div className="absolute inset-[28px] rounded-full bg-white" />
              <span className="absolute -left-5 top-8 text-[10px] text-[#666]">
                Preparing:{orderStatus.find((item) => item.status === "PREPARING")?.count ?? 0}
              </span>
              <span className="absolute right-[-18px] top-8 text-[10px] text-[#666]">
                Pending:{pendingCount}
              </span>
              <span className="absolute -left-3 bottom-7 text-[10px] text-[#666]">
                Ready:{orderStatus.find((item) => item.status === "READY")?.count ?? 0}
              </span>
              <span className="absolute right-[-14px] bottom-7 text-[10px] text-[#666]">
                Completed:{completedCount}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#e6ddd0] bg-white p-4 shadow-[0_4px_12px_rgba(44,33,18,0.04)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[#2b2b2b]">Active Offers</p>
          <span className="text-[11px] text-[#8a847d]">View all</span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {(activeOffers.length > 0 ? activeOffers : Array.from({ length: 4 }).map((_, index) => ({
            id: `placeholder-${index}`,
            title: "No active offer",
            description: "Create an offer to surface it here.",
            discountText: "0% OFF",
            imageUrl: null,
            isActive: false,
            validUntil: null,
            createdAt: "",
            updatedAt: "",
          }))).slice(0, 4).map((offer, idx) => (
            <div key={offer.id} className="overflow-hidden rounded-lg border border-[#eadfce] bg-white">
              <div className={`h-24 ${idx % 2 === 0 ? "bg-[linear-gradient(135deg,#936333,#dfb06d)]" : "bg-[linear-gradient(135deg,#4d2f1a,#c88f5b)]"}`} />
              <div className="p-2.5">
                <p className="truncate text-[11px] font-semibold text-[#23201b]">{offer.title}</p>
                <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#7a746c]">{offer.description}</p>
                <span className="mt-2 inline-flex rounded bg-[#f5ecdf] px-1.5 py-1 text-[9px] font-semibold text-brand-700">
                  {offer.discountText}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#e6ddd0] bg-white p-4 shadow-[0_4px_12px_rgba(44,33,18,0.04)]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-[#2b2b2b]">Popular Items</p>
          <div className="flex items-center gap-3 text-[11px] text-[#6f6a63]">
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#38b64a]" />Veg</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#444]" />Non Veg</span>
            <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#9370db]" />Beverages</span>
          </div>
        </div>
        <div className="grid h-[190px] grid-cols-5 items-end gap-8 rounded-lg border border-[#f0e9df] bg-[#fffdf9] px-5 py-4">
          {(popularRows.length > 0
            ? popularRows
            : [{ menuItemId: "empty", name: "No Likes Yet", diet: "VEG", likes: 1 }]).map((item) => {
            const height = popularRows.length > 0 ? Math.max(28, Math.min(92, item.likes * 12)) : 28;
            const barColor = item.diet === "VEG" ? "#39b54a" : item.diet === "NON_VEG" ? "#333333" : "#8a63d2";
            return (
              <div key={item.menuItemId} className="flex h-full flex-col items-center justify-end gap-2">
                <div className="w-8 rounded-t-sm" style={{ height: `${height}%`, backgroundColor: barColor }} />
                <span className="text-center text-[10px] leading-3 text-[#6b665f]">{item.name}</span>
                <span className="text-[9px] text-[#8a847d]">{item.likes} likes</span>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-[#6f6a63]">
          {orderStatus.map((item) => (
            <span key={item.status} className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[item.status] }} />
              {statusLabels[item.status]} {item.count}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
