import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/20 px-4 py-8" onClick={onClose}>
      <div
        className="mx-auto mt-4 w-full max-w-[760px] rounded-2xl border border-[#eadfce] bg-white p-5 shadow-[0_20px_40px_rgba(44,33,18,0.10)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-[22px] font-semibold text-[#1f1f1f]">{title}</h3>
        {children}
      </div>
    </div>
  );
}
