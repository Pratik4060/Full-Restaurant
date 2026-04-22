import React from 'react';

interface Props {
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const PaymentMethodButton: React.FC<Props> = ({
  icon,
  label,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between rounded-xl border border-orange-100 bg-gray-200 px-4 py-4 text-left shadow-[0_10px_24px_rgba(17,24,39,0.04)] transition hover:-translate-y-[1px] hover:border-orange-200 hover:shadow-[0_14px_30px_rgba(17,24,39,0.08)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#ffce7a_0%,#ffab2e_100%)] text-[11px] font-extrabold tracking-wide text-white shadow-sm">
          <img src={icon} alt={label} className="w-6 h-6 object-contain" />
        </div>
        <div>
          <span className="block text-sm font-semibold text-gray-900">{label}</span>
        </div>
      </div>

    </button>
  );
};

export default PaymentMethodButton;
