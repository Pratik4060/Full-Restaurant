import React, { useState } from 'react';
import {
  Check,
  Download,
  Share2,
  Send,
  Star,
  ChevronLeft,
} from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { useOrder } from '../contexts/OrderContext';
import logo1 from '../assets/logo1.svg';
import Ruppes from '../assets/Ruppes.svg';
import chef from "../assets/chef.svg"

interface Props {
  orderNumber: string;
  tableNumber: string;
  onBack: () => void;
  onViewChange: (view: 'menu' | 'orders' | 'track' | 'bill') => void;
}

const PaymentSuccessPage: React.FC<Props> = ({
  orderNumber,
  tableNumber,
  onBack,
  onViewChange,
}) => {
  const { orderItems } = useOrder();
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);

  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const gst = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + gst;

  const handleDownloadBill = () => {
    window.print();
  };

  const handleShare = async () => {
    const text = `Order placed successfully.\nOrder Number: #${orderNumber}\nTable: #${tableNumber}`;

    if (navigator.share) {
      await navigator.share({
        title: 'Payment Successful',
        text,
      });
      return;
    }

    await navigator.clipboard.writeText(text);
    alert('Order details copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col">
      {/* Scrollable content area with padding for bottom nav */}
      <div className="flex-1 overflow-y-auto pb-24 pt-4">
        <div className="px-4 flex items-center justify-center">
          <div className="w-full max-w-[360px] rounded-[28px] border border-[#f0c983] bg-white px-5 py-6 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
            
            {/* Header */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7f7f7] text-gray-800 shadow-sm"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <h1 className="border-b-4 border-orange-400 pb-1 text-[22px] font-semibold text-black">
                Order Completed
              </h1>

              <div className="h-10 w-10" />
            </div>

            {/* Checkmark */}
            <div className="mx-auto mt-7 flex h-16 w-16 items-center justify-center rounded-full bg-[#28d12e] shadow-sm">
              <Check className="h-9 w-9 text-white" />
            </div>

            {/* Thank You Message */}
            <h2 className="mt-8 text-center text-[22px] font-semibold text-[#1f1f1f]">
              Thank you for your order
            </h2>

            <p className="mt-4 text-center text-sm text-[#6e6e6e]">
              Payment via UPI successful
            </p>

            {/* Chef Image */}
            <div className="mx-auto mt-6 flex h-30 w-30 items-center justify-center">
              <img src={chef} alt="chef" className='h-35 w-35' />
            </div>

            {/* Order Number Card */}
            <div className="mt-4 rounded-2xl bg-[#ffd77b] px-4 py-4 text-center">
              <p className="text-sm font-semibold text-[#6a4300]">
                Order Number
              </p>
              <p className="mt-1 text-[18px] font-bold text-[#3a2400]">
                #{orderNumber || '1234'}
              </p>
              <p className="mt-1 text-xs text-[#6a4300]/80">
                Table #{tableNumber || '12'}
              </p>
            </div>

            {/* Buttons */}
            <button
              type="button"
              onClick={handleDownloadBill}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-[#ffcc66] shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download Bill
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#14eb46] px-4 py-3 text-sm font-semibold text-white shadow-sm"
            >
              <Share2 className="h-4 w-4" />
              Share via WhatsApp
            </button>

            {/* Add Note */}
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-gray-300 bg-[#efefef] px-3 py-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add Note"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
              />
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-white"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            {/* Rating Section */}
            <p className="mt-5 text-center text-sm leading-6 text-[#333]">
              We hope you enjoyed your meal! Please rate your experience.
            </p>

            <div className="mt-5 flex items-center justify-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const starValue = index + 1;
                const isActive = starValue <= rating;

                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    className="transition-transform active:scale-95"
                    aria-label={`Rate ${starValue} star${starValue > 1 ? 's' : ''}`}
                  >
                    <Star
                      className={`h-9 w-9 ${
                        isActive
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed */}
      <BottomNav activeView="bill" onViewChange={onViewChange} />

      {/* Print Styles */}
      <style>{`
        @page {
          size: auto;
          margin: 0;
        }

        @media print {
          html, body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white !important;
          }

          body * {
            visibility: hidden;
          }

          .printable-bill,
          .printable-bill * {
            visibility: visible;
          }

          .printable-bill {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            padding: 24px;
            background: white;
          }
        }
      `}</style>

      {/* Printable Bill Section */}
      <div className="printable-bill hidden print:block">
        <div className="mx-auto max-w-[420px] rounded-[24px] border border-gray-200 bg-white p-5 text-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo1} alt="logo" className="h-12 w-12 object-contain" />
              <div>
                <h2 className="text-lg font-bold">Restaurant Bill</h2>
                <p className="text-xs text-gray-500">Order Summary Receipt</p>
              </div>
            </div>

            <div className="text-right text-sm">
              <p className="font-semibold">
                {new Date().toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
              <p className="text-gray-500">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl px-4 py-4 text-center">
            <p className="text-sm font-semibold">Order Number</p>
            <p className="mt-1 text-[18px] font-bold">
              #{orderNumber || '1234'}
            </p>
            <p className="mt-1 text-xs">
              Table #{tableNumber || '12'}
            </p>
          </div>

          <div className="mt-5 rounded-2xl border border-dashed border-gray-300 p-4">
            <div className="flex items-center justify-between pb-2 text-sm font-semibold text-gray-700">
              <span>Item</span>
              <span>Amount</span>
            </div>

            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-t border-dashed border-gray-200 pt-3"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <img src={Ruppes} alt="rupees" className="h-3.5 w-3.5" />
                    <span className="text-sm font-semibold text-gray-800">
                      {(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3 rounded-2xl bg-[#fafafa] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">GST (5%)</span>
              <span className="font-medium">₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-base">
              <span className="font-semibold text-[#0a7c3c]">Total</span>
              <span className="font-bold text-[#0a7c3c]">
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            Thank you for dining with us
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
