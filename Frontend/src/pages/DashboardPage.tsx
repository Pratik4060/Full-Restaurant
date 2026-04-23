import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { MetricCard } from "../components/dashboard/MetricCard";
import { PageHeader } from "../components/layout/PageHeader";
import { Select } from "../components/ui/Select";
import { fetchDashboardThunk, setRevenuePeriod } from "../features/dashboard/dashboardSlice";
import type { OrderStatusPoint, RevenuePeriod, RevenuePoint } from "../types/api";

const statusColors: Record<OrderStatusPoint["status"], string> = {
  PENDING: "#f8a095",
  PREPARING: "#8dbef2",
  READY: "#98f7a0",
  COMPLETED: "#d39cf8",
};

const statusLabels: Record<OrderStatusPoint["status"], string> = {
  PENDING: "Pending",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
};

const revenuePeriodLabels: Record<RevenuePeriod, string> = {
  weekly: "Revenue (Last 7 Days)",
  monthly: "Revenue (Last 30 Days)",
  yearly: "Revenue (Last 12 Months)",
};

const pieOrder: OrderStatusPoint["status"][] = ["PREPARING", "PENDING", "COMPLETED", "READY"];

const compactCurrency = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
const currency = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const formatCompactRevenue = (value: number) => {
  if (value === 0) return "0";
  const raw = compactCurrency.format(value);
  return raw.replace("K", "k").replace("M", "m");
};

const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    cx,
    cy,
    "L",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
};

function RevenueChart({ points, period }: { points: RevenuePoint[]; period: RevenuePeriod }) {
  const width = 640;
  const height = 320;
  const padding = { top: 20, right: 22, bottom: 42, left: 48 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);
  const axisMax = Math.max(1000, Math.ceil(maxRevenue / 1000) * 1000);
  const gridTicks = [0, 0.25, 0.5, 0.75, 1].map((step) => axisMax * step);

  const coords = points.map((point, index) => {
    const x =
      points.length === 1
        ? padding.left + innerWidth / 2
        : padding.left + (index / (points.length - 1)) * innerWidth;
    const y = padding.top + (1 - point.revenue / axisMax) * innerHeight;
    return { ...point, x, y };
  });

  const linePath =
    coords.length > 0
      ? coords
          .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
          .join(" ")
      : "";

  const peakPoint = coords.reduce<{ x: number; y: number; label: string; revenue: number } | null>(
    (best, point) => {
      if (!best || point.revenue > best.revenue) {
        return {
          x: point.x,
          y: point.y,
          label: point.label,
          revenue: point.revenue,
        };
      }
      return best;
    },
    null
  );

  if (points.length === 0) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-[18px] border border-[#f0e9df] bg-[#fffdf9] text-[12px] text-[#7f7971]">
        No revenue data available
      </div>
    );
  }

  const tooltipX = peakPoint ? Math.min(Math.max(peakPoint.x - 48, 88), 340) : 88;
  const tooltipY = peakPoint ? Math.max(18, peakPoint.y - 66) : 18;

  return (
    <div className="relative rounded-[18px] bg-[#fffdf9] px-2 pb-2 pt-1">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[320px] w-full overflow-visible">
        {gridTicks.map((tick) => {
          const y = padding.top + (1 - tick / axisMax) * innerHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="#d6d0c8"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <line x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} stroke="#d6d0c8" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" className="fill-[#6f6a63] text-[10px]">
                {tick === 0 ? "0" : formatCompactRevenue(tick)}
              </text>
            </g>
          );
        })}

        {coords.length > 0 && (
          <path d={linePath} fill="none" stroke="#ff7a1a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {coords.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="3.5" fill="#ffffff" stroke="#ff7a1a" strokeWidth="2" />
            <text x={point.x} y={height - 12} textAnchor="middle" className="fill-[#8a847d] text-[10px]">
              {point.label}
            </text>
          </g>
        ))}
      </svg>

      {peakPoint ? (
        <div
          className="absolute z-10 rounded-[3px] border border-[#ece6dc] bg-white px-4 py-3 shadow-[0_10px_26px_rgba(0,0,0,0.08)]"
          style={{ left: `${tooltipX}px`, top: `${tooltipY}px` }}
        >
          <p className="text-[12px] font-medium text-[#1f1f1f]">{peakPoint.label}</p>
          <p className="mt-2 text-[12px] text-[#1f1f1f]">Revenue : ₹{currency.format(peakPoint.revenue)}</p>
        </div>
      ) : null}

      <div className="mt-1 flex justify-center text-[11px] text-[#7f7971]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full border border-[#ff7a1a] bg-white" />
          Revenue
        </span>
        <span className="sr-only">{revenuePeriodLabels[period]}</span>
      </div>
    </div>
  );
}

type PopularGroup = "veg" | "nonVeg" | "beverages";

const popularGroupLabels: Record<PopularGroup, string> = {
  veg: "Veg",
  nonVeg: "Non Veg",
  beverages: "Beverages",
};

const popularGroupColors: Record<PopularGroup, string> = {
  veg: "#35b935",
  nonVeg: "#e66565",
  beverages: "#4ea0ff",
};

const splitPopularLabel = (name: string) => {
  if (name.length <= 12) return [name];
  const parts = name.split(" ");
  if (parts.length < 2) return [name];
  return [parts[0], parts.slice(1).join(" ")];
};

function StatusPieChart({ items }: { items: OrderStatusPoint[] }) {
  const width = 360;
  const height = 360;
  const cx = 180;
  const cy = 180;
  const radius = 95;
  const labelLayout: Record<
    OrderStatusPoint["status"],
    {
      textX: number;
      textY: number;
      textAnchor: "start" | "end";
      elbowX: number;
      elbowY: number;
    }
  > = {
    PREPARING: { textX: 32, textY: 62, textAnchor: "start", elbowX: 82, elbowY: 84 },
    PENDING: { textX: 328, textY: 62, textAnchor: "end", elbowX: 278, elbowY: 84 },
    READY: { textX: 32, textY: 326, textAnchor: "start", elbowX: 82, elbowY: 306 },
    COMPLETED: { textX: 328, textY: 326, textAnchor: "end", elbowX: 278, elbowY: 306 },
  };

  const statusMap = new Map(items.map((item) => [item.status, item.count]));
  const orderedItems = pieOrder.map((status) => ({
    status,
    count: statusMap.get(status) ?? 0,
  }));
  const total = orderedItems.reduce((sum, item) => sum + item.count, 0);
  const visibleSegments = orderedItems.filter((item) => item.count > 0);

  let cursor = -90;

  const segments = visibleSegments.map((item) => {
    const sweep = total > 0 ? (item.count / total) * 360 : 0;
    const start = cursor;
    const end = cursor + sweep;
    cursor = end;
    const mid = start + sweep / 2;
    const inner = polarToCartesian(cx, cy, radius, mid);
    const target = labelLayout[item.status];
    const connector = {
      x: target.elbowX,
      y: target.elbowY,
    };

    return {
      ...item,
      start,
      end,
      mid,
      path: total > 0 ? describeArc(cx, cy, radius, start, end) : "",
      connectorStart: inner,
      connectorMid: {
        x: cx + Math.cos(((mid - 90) * Math.PI) / 180) * 118,
        y: cy + Math.sin(((mid - 90) * Math.PI) / 180) * 118,
      },
      connector,
      label: target,
    };
  });

  return (
    <div className="relative h-[360px] overflow-visible rounded-[24px] bg-[#fffaf2]">
      <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full overflow-visible">
        {total === 0 ? (
          <circle cx={cx} cy={cy} r={radius} fill="#f3ece1" />
        ) : visibleSegments.length === 1 ? (
          <circle cx={cx} cy={cy} r={radius} fill={statusColors[visibleSegments[0].status]} />
        ) : (
          segments.map((segment) => (
            <g key={segment.status}>
              <path d={segment.path} fill={statusColors[segment.status]} stroke={statusColors[segment.status]} strokeWidth="1" />
              <polyline
                points={`${segment.connectorStart.x},${segment.connectorStart.y} ${segment.connectorMid.x},${segment.connectorMid.y} ${segment.connector.x},${segment.connector.y}`}
                fill="none"
                stroke={statusColors[segment.status]}
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          ))
        )}

        {total > 0 && visibleSegments.length === 1 ? (
          <text x={cx} y={cy + 6} textAnchor="middle" className="fill-white text-[22px] font-bold">
            {visibleSegments[0].count}
          </text>
        ) : null}
      </svg>

      {pieOrder.map((status) => {
        const item = orderedItems.find((entry) => entry.status === status);
        const label = labelLayout[status];
        if (!item || item.count <= 0) return null;
        return (
          <div
            key={status}
            className="pointer-events-none absolute text-[11px] font-semibold text-[#1f1f1f]"
            style={{
              left: label.textAnchor === "start" ? label.textX : undefined,
              right: label.textAnchor === "end" ? 32 : undefined,
              top: label.textY,
              textAlign: label.textAnchor,
            }}
          >
            {statusLabels[status]}:{item.count}
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPage() {
  const dispatch = useAppDispatch();
  const { summary, revenue, revenuePeriod, orderStatus, activeOffers, popularItems } = useAppSelector((s) => s.dashboard);
  const [popularGroup, setPopularGroup] = useState<PopularGroup>("veg");
  const [hoveredPopularIndex, setHoveredPopularIndex] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchDashboardThunk(revenuePeriod));
  }, [dispatch, revenuePeriod]);

  const selectedPopularRows = useMemo(() => {
    const source =
      popularGroup === "veg" ? (popularItems?.veg ?? []) : popularGroup === "nonVeg" ? (popularItems?.nonVeg ?? []) : (popularItems?.beverages ?? []);

    return [...source].sort((a, b) => b.likes - a.likes).slice(0, 5);
  }, [popularGroup, popularItems]);

  const popularAxisMax = 100;

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

      <section className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-[18px] border border-[#ddd7cf] bg-white p-5 shadow-[0_8px_28px_rgba(44,33,18,0.05)]">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-[#1f1f1f]">{revenuePeriodLabels[revenuePeriod]}</p>
            <Select
              value={revenuePeriod}
              onChange={(e) => dispatch(setRevenuePeriod(e.target.value as RevenuePeriod))}
              className="h-10 w-28 rounded-lg border-[#dad3ca] bg-white text-[12px]"
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </div>
          <RevenueChart points={revenue?.points ?? []} period={revenuePeriod} />
        </div>

        <div className="rounded-[18px] border border-[#ddd7cf] bg-white p-5 shadow-[0_8px_28px_rgba(44,33,18,0.05)]">
          <p className="mb-5 text-[13px] font-semibold text-[#1f1f1f]">Orders by Status</p>
          <StatusPieChart items={orderStatus} />
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

      <section className="rounded-[18px] border border-[#ddd7cf] bg-white p-5 shadow-[0_8px_28px_rgba(44,33,18,0.05)]">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-[#1f1f1f]">Popular Items</p>
          <div className="flex items-center gap-4 text-[13px] text-[#1f1f1f]">
            {(Object.keys(popularGroupLabels) as PopularGroup[]).map((group) => {
              const active = popularGroup === group;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => setPopularGroup(group)}
                  className="inline-flex items-center gap-3 transition"
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full border"
                    style={{ borderColor: active ? popularGroupColors[group] : "#bdb7af" }}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: active ? popularGroupColors[group] : "transparent" }}
                    />
                  </span>
                  <span>{popularGroupLabels[group]}</span>
                </button>
              );
            })}
            <button
              type="button"
              className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-[#27221c] transition hover:border-[#ddd4c6] hover:bg-[#faf7f1]"
              aria-label="Download popular items chart"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v11" />
                <path d="m8 10 4 4 4-4" />
                <path d="M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#f0e9df] bg-[#fffdf9] px-5 pb-5 pt-4">
          <div className="relative h-[306px]">
            <svg viewBox="0 0 760 306" className="h-full w-full overflow-visible">
              <line x1="48" y1="22" x2="48" y2="248" stroke="#cfc7bd" strokeWidth="1.2" />
              <line x1="48" y1="248" x2="744" y2="248" stroke="#cfc7bd" strokeWidth="1.2" />

              {[100, 75, 50, 25, 0].map((tick) => {
                const y = 22 + ((100 - tick) / 100) * 226;
                return (
                  <g key={tick}>
                    <line x1="48" x2="744" y1={y} y2={y} stroke="#d8d2c8" strokeDasharray="2.5 4" strokeWidth="1" />
                    <text x="34" y={y + 4} textAnchor="end" className="fill-[#8a847d] text-[11px]">
                      {tick}
                    </text>
                  </g>
                );
              })}

              {(selectedPopularRows.length > 0
                ? selectedPopularRows
                : [{ menuItemId: "empty", name: "No items", diet: "VEG", likes: 0 }]).map((item, index) => {
                const values = selectedPopularRows.length > 0 ? selectedPopularRows : [];
                const slotWidth = 696 / Math.max(values.length || 1, 1);
                const barWidth = Math.min(44, Math.max(36, slotWidth * 0.28));
                const barX = 48 + slotWidth * index + slotWidth / 2 - barWidth / 2;
                const barHeight = selectedPopularRows.length > 0 ? Math.max(10, (item.likes / popularAxisMax) * 188) : 0;
                const barTop = 248 - barHeight;
                const isHovered = hoveredPopularIndex === index;
                const tooltipWidth = 78;
                const tooltipHeight = 32;
                const tooltipX = barX + barWidth / 2 < 380 ? barX + barWidth + 12 : barX - tooltipWidth - 12;
                const tooltipY = Math.max(34, barTop - 46);
                const tooltipTextX = tooltipX + 12;
                const tooltipValueX = tooltipX + 43;
                const labelLines = splitPopularLabel(item.name);

                return (
                  <g
                    key={item.menuItemId}
                    onMouseEnter={() => setHoveredPopularIndex(index)}
                    onMouseLeave={() => setHoveredPopularIndex(null)}
                    onFocus={() => setHoveredPopularIndex(index)}
                    onBlur={() => setHoveredPopularIndex(null)}
                    tabIndex={0}
                    style={{ cursor: "default" }}
                  >
                    {isHovered ? (
                      <g>
                        <rect
                          x={tooltipX}
                          y={tooltipY}
                          width={tooltipWidth}
                          height={tooltipHeight}
                          rx="8"
                          fill="#ffffff"
                          stroke="#d9d3c9"
                        />
                        <path
                          d={`M ${barX + barWidth / 2} ${barTop - 2} L ${barX + barWidth / 2 - 8} ${barTop - 14} L ${barX + barWidth / 2 + 8} ${barTop - 14} Z`}
                          fill="#ffffff"
                          stroke="#d9d3c9"
                        />
                        <text x={tooltipTextX} y={tooltipY + 21} className="fill-[#26211b] text-[12px]">
                          Like :
                        </text>
                        <text x={tooltipValueX} y={tooltipY + 21} className="fill-[#35b935] text-[12px]">
                          {item.likes}
                        </text>
                      </g>
                    ) : null}

                    <rect
                      x={barX}
                      y={barTop}
                      width={barWidth}
                      height={barHeight}
                      rx="2"
                      fill={popularGroupColors[popularGroup]}
                    />

                    <text x={barX + barWidth / 2} y={270} textAnchor="middle" className="fill-[#4c4741] text-[11px]">
                      {labelLines.length === 1 ? (
                        <tspan x={barX + barWidth / 2} dy="0">
                          {labelLines[0]}
                        </tspan>
                      ) : (
                        <>
                          <tspan x={barX + barWidth / 2} dy="0">
                            {labelLines[0]}
                          </tspan>
                          <tspan x={barX + barWidth / 2} dy="14">
                            {labelLines[1]}
                          </tspan>
                        </>
                      )}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
}
