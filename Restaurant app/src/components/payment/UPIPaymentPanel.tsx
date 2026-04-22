import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ScanLine, ShieldCheck } from 'lucide-react';

interface Props {
  orderNumber: string;
  tableNumber: string;
  onBack: () => void;
  onPaid: () => void;
}

const UPIPaymentPanel: React.FC<Props> = ({
  orderNumber,
  tableNumber,
  onBack,
  onPaid,
}) => {
  const qrValue = useMemo(() => {
    return `${window.location.origin}/?payment=upi&order=${orderNumber}&table=${tableNumber}`;
  }, [orderNumber, tableNumber]);

  return (
    <div className="w-full">


      <div className="overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-[0_20px_45px_rgba(17,24,39,0.08)]">
        <div className="bg-[linear-gradient(135deg,#fff7ea_0%,#fffdf8_45%,#fff1db_100%)] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
              <ScanLine className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">UPI Payment</h2>
              <p className="text-xs text-gray-600">Scan the QR from your phone</p>
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
          <div className="flex justify-center">
            <div className="rounded-[28px] border border-orange-100 bg-white p-4 shadow-[0_14px_30px_rgba(17,24,39,0.06)]">
              <QRCodeSVG value={qrValue} size={220} />
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#fff8ef] px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
            <p className="text-xs leading-5 text-gray-600">
              Scan this QR on the customer phone. Once the payment is marked as paid, the screen will move to success automatically.
            </p>
          </div>
          <div className='flex justify-center mt-5 '>
            <div className="flex w-full gap-3">
              <button
                type="button"
                onClick={onBack}
                className="text-sm font-semibold text-white transition bg-black p-2 rounded-md w-full h-10"
              >
                Back
              </button>
              <button
                type="button"
                onClick={onPaid}
                className="text-sm font-semibold text-white transition bg-[#18B65B] p-2 rounded-md w-full h-10"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentPanel;
