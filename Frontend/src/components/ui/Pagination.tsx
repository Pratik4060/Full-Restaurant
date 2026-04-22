import { Button } from "./Button";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5);

  return (
    <div className="flex items-center justify-end gap-2 text-[12px] text-[#6f6a63]">
      <Button
        variant="secondary"
        className="h-8 px-3"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </Button>
      <div className="flex items-center gap-1">
        {pages.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`h-8 min-w-8 rounded-md border px-2 text-[12px] transition ${
              item === page
                ? "border-brand-300 bg-brand-100 text-brand-700"
                : "border-transparent bg-transparent text-[#6f6a63] hover:bg-[#f3efe8]"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
      <Button
        variant="secondary"
        className="h-8 px-3"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
