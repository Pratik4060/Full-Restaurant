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
    <div
      className="fixed inset-0 z-40 overflow-y-auto bg-black/45 px-4 py-4 sm:px-6 sm:py-6"
      onClick={onClose}
    >
      <div
        className="mx-auto flex min-h-full items-center justify-center"
      >
        <div
          className="my-auto flex w-full max-w-[560px] max-h-[calc(100vh-32px)] flex-col overflow-hidden rounded-[24px] border border-[#eadfce] bg-white px-5 py-5 shadow-[0_20px_40px_rgba(44,33,18,0.10)] sm:max-h-[calc(100vh-48px)] sm:px-6 sm:py-6"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="mb-4 shrink-0 text-[18px] font-medium tracking-tight text-[#1f1f1f] sm:mb-6">
            {title}
          </h3>
          <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
