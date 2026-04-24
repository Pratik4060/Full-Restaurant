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
    <div className="fixed inset-0 z-40 bg-black/45 px-4 py-8" onClick={onClose}>
      <div
        className="mx-auto mt-6 w-full max-w-[560px] rounded-[24px] border border-[#eadfce] bg-white px-6 py-6 shadow-[0_20px_40px_rgba(44,33,18,0.10)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-6 text-[18px] font-medium tracking-tight text-[#1f1f1f]">{title}</h3>
        {children}
      </div>
    </div>
  );
}
