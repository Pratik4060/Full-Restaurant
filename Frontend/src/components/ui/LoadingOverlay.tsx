export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/18 backdrop-blur-[1px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex items-center gap-3 rounded-[16px] border border-[#eadfce] bg-white px-5 py-4 shadow-[0_18px_40px_rgba(44,33,18,0.16)]">
        <svg className="h-5 w-5 animate-spin text-[#9a742f]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-[13px] font-medium text-[#1f1f1f]">{message}</span>
      </div>
    </div>
  );
}
