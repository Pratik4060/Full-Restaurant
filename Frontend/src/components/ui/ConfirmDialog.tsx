import type { ReactNode } from "react";
import { Modal } from "./Modal";

type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  pending?: boolean;
};

export function ConfirmDialog({
  open,
  title = "Confirm Delete",
  message,
  confirmLabel = "Yes, Delete",
  cancelLabel = "No, Cancel",
  onConfirm,
  onCancel,
  pending = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="space-y-6">
        <p className="text-[14px] leading-6 text-[#3a332b]">{message}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#ded4c8] bg-white px-5 text-[14px] font-medium text-[#5b534a] transition hover:bg-[#f9f6f2]"
            disabled={pending}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#ff5b5b] bg-[#ff5b5b] px-5 text-[14px] font-medium text-white transition hover:bg-[#ea4b4b] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={pending}
          >
            {pending ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
