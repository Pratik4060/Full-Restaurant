import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useOrder } from "../contexts/OrderContext";
import bell from "../assets/bell.svg";
import Ruppes from "../assets/Ruppes.svg";
import bill1Svg from "../assets/bill1.svg?raw";
import PaymentMethodButton from "../components/payment/PaymentMethodButton";
import UPIPaymentPanel from "../components/payment/UPIPaymentPanel";
import CardPaymentPanel from "../components/payment/CardPaymentPanel";
import CashPaymentPanel from "../components/payment/CashPaymentPanel";
import PaymentSuccessPage from "./PaymentSuccessPage";
import scan from "../assets/scan.svg";
import counter from "../assets/counter.svg";
import { restaurantApi, type PublicOrder } from "../services/restaurantApi";
import { useRealtimeInvalidate } from "../hooks/useRealtimeInvalidate";
import {
  buildPublicOrderSnapshot,
  formatDisplayOrderNumber,
} from "../lib/orderSnapshot";
import ReadyOrderBell from "../components/ui/ReadyOrderBell";

interface BillPageProps {
  onBack: () => void;
  onViewChange: (view: "menu" | "orders" | "track" | "bill") => void;
  orderPlaced: boolean;
  tableNumber: string;
  orderNumber?: string;
}

type PaymentMethod = "upi" | "card" | "cash" | null;

const BillPage: React.FC<BillPageProps> = ({
  onBack,
  onViewChange,
  orderPlaced,
  tableNumber,
  orderNumber = "1234",
}) => {
  const {
    clearOrder,
    resetPlacedOrder,
    markOrderPaid,
    hasReadyOrderNotification,
    getOrderByNumber,
    orderItems,
  } = useOrder();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [paid, setPaid] = useState(false);
  const [orderData, setOrderData] = useState<PublicOrder | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderNumber));
  const localOrderDataRef = React.useRef<PublicOrder | null>(null);

  const localOrderData = useMemo(
    () =>
      buildPublicOrderSnapshot(
        orderNumber ?? "",
        getOrderByNumber(orderNumber ?? ""),
        orderItems,
      ),
    [getOrderByNumber, orderItems, orderNumber],
  );

  useEffect(() => {
    localOrderDataRef.current = localOrderData;
  }, [localOrderData]);

  const loadOrder = useCallback(async () => {
    if (!orderNumber) return;

    try {
      setIsLoading(true);
      const data = await restaurantApi.getOrder(orderNumber);
      setOrderData(data);
      setPaid(Boolean(data.payment));
    } catch {
      setOrderData(localOrderDataRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber]);

  useRealtimeInvalidate(["orders", "billing"], () => {
    void loadOrder();
  });

  useEffect(() => {
    if (!orderNumber) return;

    let cancelled = false;

    const loadOrderWithGuard = async () => {
      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const data = await restaurantApi.getOrder(orderNumber);
        if (!cancelled) {
          setOrderData(data);
          setPaid(Boolean(data.payment));
        }
      } catch {
        if (!cancelled) {
          setOrderData(localOrderData);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadOrderWithGuard();
    const interval = setInterval(() => void loadOrderWithGuard(), 4000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderNumber]);

  const visibleOrderData = orderData ?? localOrderData;
  const displayOrderNumber = formatDisplayOrderNumber(visibleOrderData?.orderNumber);

  const completePayment = async (method: "UPI" | "CARD" | "CASH") => {
    const response = await restaurantApi.payOrder(orderNumber, method);
    setOrderData(response);
    markOrderPaid(orderNumber);
    setPaid(true);
  };

  if (paid) {
    return (
      <PaymentSuccessPage
        orderNumber={orderNumber}
        tableNumber={tableNumber}
        onBack={() => {
          clearOrder();
          resetPlacedOrder();
          setPaid(false);
          setPaymentMethod(null);
        }}
        onViewChange={onViewChange}
      />
    );
  }

  if (paymentMethod === "upi") {
    return (
      <UPIPaymentPanel
        orderNumber={orderNumber}
        tableNumber={tableNumber}
        onBack={() => setPaymentMethod(null)}
        onPaid={() => void completePayment("UPI")}
      />
    );
  }

  if (paymentMethod === "card") {
    return (
      <CardPaymentPanel
        orderNumber={orderNumber}
        tableNumber={tableNumber}
        onBack={() => setPaymentMethod(null)}
        onPaid={async () => {
          await completePayment("CARD");
        }}
      />
    );
  }

  if (paymentMethod === "cash") {
    return (
      <CashPaymentPanel
        orderNumber={orderNumber}
        tableNumber={tableNumber}
        onBack={() => setPaymentMethod(null)}
        onPaid={() => void completePayment("CASH")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex flex-col">
      <div className="px-6 md:px-8 pt-12 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={32} className="text-gray-700 md:w-8 md:h-8" />
        </button>

        <h1 className="text-[28px] md:text-[32px] font-semibold text-black border-b-4 border-orange-400 pb-2">
          Payment
        </h1>

        <ReadyOrderBell
          hasNotification={hasReadyOrderNotification}
          ariaLabel="Order notifications"
          popupText="Order is ready"
          buttonClassName="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          popupClassName="right-0"
          dotClassName="right-1 top-1"
        >
          <img src={bell} alt="bell" className="h-7 w-7 md:h-8 md:w-8 invert" />
        </ReadyOrderBell>
      </div>

      <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-28">
        <div className="max-w-full mx-auto">
          {!orderPlaced || !orderNumber ? (
            <div className="bg-white rounded-[32px] border border-orange-200 shadow-sm px-6 py-12 mt-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                No bill available
              </h2>
              <p className="text-base md:text-lg text-gray-500 font-medium">
                Place an order first to view the bill.
              </p>
            </div>
          ) : isLoading && !visibleOrderData ? (
            <div className="bg-white rounded-[32px] border border-orange-200 shadow-sm px-6 py-12 mt-16 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                Loading bill
              </h2>
              <p className="text-base md:text-lg text-gray-500 font-medium">
                We are fetching your bill details.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[32px] border border-orange-200 shadow-sm px-6 py-8 w-full">
                <div className="flex flex-col items-center text-center">

                  <h2 className="text-xl md:text-2xl font-semibold text-black">
                    Order Summary
                  </h2>
                  <p className="text-base text-gray-400 mt-2">
                    {displayOrderNumber ? `Order ${displayOrderNumber}` : "Order placed"} - Table {visibleOrderData?.tableNumber}
                  </p>
                </div>

                <div className="my-8 flex justify-center">
                  <div
                    className="w-28 h-28 overflow-hidden [&>svg]:h-full [&>svg]:w-full [&>svg]:object-contain"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: bill1Svg }}
                  />
                </div>

                <div className="pt-6 space-y-4">
                  {visibleOrderData?.items.length === 0 ? (
                    <p className="text-center text-gray-400 text-base">
                      No items added yet
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-dashed border-gray-300 pb-3">
                        <p className="text-lg md:text-xl font-semibold text-gray-800 w-1/2">Item</p>
                        <p className="text-lg md:text-xl font-semibold text-gray-800 w-1/4 text-center">Qty</p>
                        <p className="text-lg md:text-xl font-semibold text-gray-800 w-1/4 text-right">Price</p>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {visibleOrderData?.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-2">
                            <p className="text-base md:text-lg text-gray-800 w-1/2">{item.name}</p>
                            <p className="text-base md:text-lg text-gray-600 w-1/4 text-center">
                              {item.quantity}
                            </p>
                            <div className="flex items-center justify-end gap-1.5 w-1/4">
                              <img src={Ruppes} alt="rupees" className="w-4 h-4 md:w-5 md:h-5" />
                              <span className="text-base md:text-lg text-gray-800">
                                {item.totalPrice.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t border-dashed border-gray-300 mt-8 pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-base md:text-lg text-gray-700">Subtotal</span>
                    <div className="flex items-center gap-1.5 text-base md:text-lg text-gray-700">
                      <img src={Ruppes} alt="rupees" className="w-4 h-4 md:w-5 md:h-5" />
                    <span>
                      {visibleOrderData ? visibleOrderData.subtotal.toLocaleString("en-IN") : "0"}
                    </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-base md:text-lg text-gray-700">GST (5%)</span>
                    <div className="flex items-center gap-1.5 text-base md:text-lg ">
                      <img
                        src={Ruppes}
                        alt="rupees"
                        className="w-4 h-4 md:w-5 md:h-5 "
                      />
                      <span>
                        {visibleOrderData ? visibleOrderData.gst.toLocaleString("en-IN") : "0"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-5 flex items-center justify-between">
                    <span className="text-xl md:text-2xl font-bold text-[#18B65B]">
                      Total Amount
                    </span>
                    <div className="flex items-center gap-1.5 text-xl md:text-2xl font-bold text-[#18B65B]">
                      <img src={Ruppes} alt="rupees" className="w-5 h-5 md:w-6 md:h-6" />
                      <span>
                        {visibleOrderData
                          ? visibleOrderData.totalAmount.toLocaleString("en-IN")
                          : "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[32px] px-6 py-8 border border-gray-100 shadow-sm w-full">
                <h3 className="text-xl md:text-2xl font-bold text-black mb-6">
                  Select Payment Method
                </h3>

                <div className="space-y-4">
                  <PaymentMethodButton
                    icon={scan}
                    label="UPI"
                    onClick={() => setPaymentMethod("upi")}
                  />

                  <PaymentMethodButton
                    icon={scan}
                    label="Card"
                    onClick={() => setPaymentMethod("card")}
                  />

                  <PaymentMethodButton
                    icon={counter}
                    label="Pay at Counter / Cash"
                    onClick={() => setPaymentMethod("cash")}
                  />
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <p className="text-sm text-gray-500 text-center">
                    Secure payment powered by your restaurant
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav activeView="bill" onViewChange={onViewChange} />
    </div>
  );
};

export default BillPage;
