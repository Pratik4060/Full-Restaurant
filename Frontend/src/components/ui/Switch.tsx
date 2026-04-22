export function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full border px-1 transition ${
        checked ? "border-[#66c076] bg-[#effbf1]" : "border-[#d8d2c8] bg-[#f3f0eb]"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full shadow-sm transition ${
          checked ? "translate-x-5 bg-[#46b35c]" : "translate-x-0 bg-white"
        }`}
      />
    </button>
  );
}
