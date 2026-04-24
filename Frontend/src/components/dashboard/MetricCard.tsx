export function MetricCard({
  title,
  value,
  note,
  icon,
  noteClassName = "text-[#63aa6c]",
}: {
  title: string;
  value: string;
  note: string;
  icon?: string;
  noteClassName?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#e6ddd0] bg-white px-4 py-4 pr-14 shadow-[0_4px_12px_rgba(44,33,18,0.04)]">
      <p className="text-[12px] font-medium text-[#5f5a53]">{title}</p>
      <p className="mt-3 text-[22px] font-semibold text-[#1f1f1f]">{value}</p>
      <p className={`mt-4 text-[11px] font-medium ${noteClassName}`}>{note}</p>

      {icon ? (
        <img
          src={icon}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-8 w-8 -translate-y-1/2 object-contain"
        />
      ) : null}
    </div>
  );
}
