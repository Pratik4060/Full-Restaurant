import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-[26px] font-semibold text-[#1f1f1f]">{title}</h1>
        <p className="mt-1 text-[12px] text-[#8a847d]">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
