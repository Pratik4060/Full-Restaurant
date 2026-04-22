import React from 'react';
import logo from '../assets/logo.svg';
import qrCode from '../assets/qr.svg';

interface Props {
  onScan: () => void;
}

const QRScanner: React.FC<Props> = ({ onScan }) => {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,#fff7ee_0%,#fff9f3_30%,#f4e3cf_64%,#e6d2bc_100%)] px-6 pb-10 pt-8">
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[-5%] top-[-8%] h-56 w-56 rounded-full bg-[#f8c992]/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] h-72 w-72 rounded-full bg-[#d8b28d]/45 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1180px] flex-1 flex-col">
        <div className="mb-14">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/70 bg-white/85 shadow-[0_12px_30px_rgba(150,102,53,0.12)] backdrop-blur">
            <img src={logo} alt="Zohnix" className="h-11 w-11 object-contain" />
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="mb-14 max-w-[360px] text-center text-base font-medium leading-[1.35] text-[#2f261d] sm:text-lg">
            Scan the QR to explore our menu and order instantly
          </p>

          <div className="relative flex h-[280px] w-[280px] items-center justify-center sm:h-[320px] sm:w-[320px]">
            <div className="absolute left-0 top-0 h-20 w-20 rounded-tl-[32px] border-l-2 border-t-2 border-[#f0a343]" />
            <div className="absolute right-0 top-0 h-20 w-20 rounded-tr-[32px] border-r-2 border-t-2 border-[#f0a343]" />
            <div className="absolute bottom-0 left-0 h-20 w-20 rounded-bl-[32px] border-b-2 border-l-2 border-[#f0a343]" />
            <div className="absolute bottom-0 right-0 h-20 w-20 rounded-br-[32px] border-b-2 border-r-2 border-[#f0a343]" />

            <button
              type="button"
              onClick={onScan}
              className="relative flex h-[275px] w-[275px] flex-col items-center justify-center overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#8d8d8d_0%,#d9d9d9_100%)] shadow-[0_18px_45px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="relative z-10 rounded-xl bg-white p-2 shadow-md">
                <img src={qrCode} alt="Scan menu QR" className="h-35 w-35 rounded-sm fit-object" />
              </div>
            </button>
          </div>

          <p className="mt-10 text-sm text-[#6e5a45]">
            Click the QR card to continue
          </p>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
