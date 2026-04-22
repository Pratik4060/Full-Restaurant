import React from 'react';
import { CheckCircle2, HandCoins } from 'lucide-react';

interface Props {
    orderNumber: string;
    tableNumber: string;
    onBack: () => void;
    onPaid: () => void;
}

const CashPaymentPanel: React.FC<Props> = ({
    orderNumber,
    tableNumber,
    onBack,
    onPaid,
}) => {
    return (
        <div className="w-full">


            <div className="overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-[0_20px_45px_rgba(17,24,39,0.08)]">
                <div className="bg-[linear-gradient(135deg,#fff7ea_0%,#fffdf8_45%,#fff1db_100%)] px-5 py-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm">
                            <HandCoins className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Cash Payment</h2>
                            <p className="text-xs text-gray-600">Pay at the counter after dining</p>
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
                    <div className="flex items-start gap-3 rounded-2xl bg-[#fff8ef] px-4 py-4">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                Order placed successfully
                            </p>
                            <p className="mt-1 text-xs leading-5 text-gray-600">
                                Please proceed to the counter and complete the payment there. Once staff marks it as paid, the order can move to success.
                            </p>
                        </div>


                    </div>
                    <div className='flex justify-center mt-4 gap-3 '>
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-35 rounded-2xl bg-[linear-gradient(180deg,#1f1f1f_0%,#090909_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:brightness-110 disabled:opacity-60"
                        >

                            Back
                        </button>
                        <button
                            type="button"
                            onClick={onPaid}
                            className="w-45 rounded-2xl bg-[linear-gradient(180deg,#18B65B_0%,#119144_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] transition hover:brightness-110 disabled:opacity-60"
                        >
                            Confirm Cash Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CashPaymentPanel;
