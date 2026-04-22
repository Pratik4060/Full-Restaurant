export function MetricCard({
  title,
  value,
  note,
}: {
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-[#e6ddd0] bg-white p-4 shadow-[0_4px_12px_rgba(44,33,18,0.04)]">
      <p className="text-[12px] font-medium text-[#5f5a53]">{title}</p>
      <p className="mt-2 text-[22px] font-semibold text-[#1f1f1f]">{value}</p>
      <p className="mt-2 text-[11px] font-medium text-[#63aa6c]">{note}</p>
    </div>
  );
}
