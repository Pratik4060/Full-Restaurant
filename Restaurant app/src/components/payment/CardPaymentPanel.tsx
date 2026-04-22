import React, { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';

interface Props {
  orderNumber: string;
  tableNumber: string;
  onBack: () => void;
  onPaid: () => Promise<void>;
}

const CardPaymentPanel: React.FC<Props> = ({
  orderNumber,
  tableNumber,
  onBack,
  onPaid,
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    const digits = cardNumber.replace(/\D/g, '');
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;

    if (digits.length < 12 || digits.length > 19) {
      setError('Enter a valid card number.');
      return;
    }

    if (cardHolder.trim().length < 2) {
      setError('Enter the card holder name.');
      return;
    }

    if (!expiryPattern.test(expiry.trim())) {
      setError('Use expiry format MM/YY.');
      return;
    }

    if (!/^\d{3,4}$/.test(cvv.trim())) {
      setError('Enter a valid CVV.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onPaid();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">


      <div className="overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-[0_20px_45px_rgba(17,24,39,0.08)]">
        <div className="bg-[linear-gradient(135deg,#fff7ea_0%,#fffdf8_45%,#fff1db_100%)] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <CreditCard className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Card Payment</h2>
              <p className="text-xs text-gray-600">Secure checkout in a clean form</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/80 px-3 py-3 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Order
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                #{orderNumber}
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 px-3 py-3 backdrop-blur">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Table
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-900">
                #{tableNumber}
              </p>
            </div>
          </div>
        </div>

        <div className="px-5 py-6">
          <div className="flex items-start gap-3 rounded-2xl bg-[#fff8ef] px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <p className="text-xs leading-5 text-gray-600">
              Enter the card details below. This is a demo UI for now, but the layout is ready for a gateway later.
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Card Number</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                inputMode="numeric"
                placeholder="1234 5678 9012 3456"
                className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">Card Holder Name</label>
              <input
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Name on card"
                className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Expiry</label>
                <input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">CVV</label>
                <input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="123"
                  className="w-full rounded-2xl border border-gray-200 bg-[#fcfcfc] px-4 py-3 outline-none transition focus:border-orange-400 focus:bg-white"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePay}
              disabled={loading}
              className="w-full rounded-2xl bg-[linear-gradient(180deg,#1f1f1f_0%,#090909_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:brightness-110 disabled:opacity-60"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>

            <div className='flex justify-center  '>
 <button
        type="button"
        onClick={onBack}
              className="w-full rounded-2xl bg-[linear-gradient(180deg,#1f1f1f_0%,#090909_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:brightness-110 disabled:opacity-60"
      >
        
        Back
      </button> 
      </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardPaymentPanel;
