import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCircle, ChefHat, ChevronLeft } from "lucide-react";
import BottomNav from "../components/BottomNav";
import { useOrder } from "../contexts/OrderContext";
import { restaurantApi, type PublicOrder } from "../services/restaurantApi";
import { useRealtimeInvalidate } from "../hooks/useRealtimeInvalidate";
import {
  buildPublicOrderSnapshot,
  formatDisplayOrderNumber,
} from "../lib/orderSnapshot";
import ReadyOrderBell from "../components/ui/ReadyOrderBell";

interface TrackOrderPageProps {
  onBack: () => void;
  onViewChange: (view: "menu" | "orders" | "track" | "bill") => void;
  orderPlaced: boolean;
  orderNumber?: string;
  estimatedTime?: string;
  onReadyComplete?: () => void;
}

const TrackOrderPage: React.FC<TrackOrderPageProps> = ({
  onBack,
  onViewChange,
  orderPlaced,
  orderNumber,
  estimatedTime = "15-20",
  onReadyComplete,
}) => {
  const {
    updateOrderStatus,
    hasReadyOrderNotification,
    getOrderByNumber,
    orderItems,
  } = useOrder();
  const [orderData, setOrderData] = useState<PublicOrder | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderNumber));

  const localOrderData = useMemo(
    () =>
      buildPublicOrderSnapshot(
        orderNumber ?? "",
        getOrderByNumber(orderNumber ?? ""),
        orderItems,
      ),
    [getOrderByNumber, orderItems, orderNumber],
  );

  const loadOrder = useCallback(async () => {
    if (!orderNumber) return;

    try {
      setIsLoading(true);
      const data = await restaurantApi.getOrder(orderNumber);
      setOrderData(data);
    } catch {
      setOrderData(localOrderData);
    } finally {
      setIsLoading(false);
    }
  }, [localOrderData, orderNumber]);

  useRealtimeInvalidate(["orders", "billing"], () => {
    void loadOrder();
  });

  useEffect(() => {
    if (!orderNumber) return;

    let cancelled = false;
    let visibilityHandler: (() => void) | null = null;

    const loadOrderWithGuard = async () => {
      try {
        if (!cancelled) {
          setIsLoading(true);
        }
        const data = await restaurantApi.getOrder(orderNumber);
        if (!cancelled) {
          setOrderData(data);
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
    const interval = setInterval(() => void loadOrderWithGuard(), 1500);

    if (typeof window !== "undefined") {
      visibilityHandler = () => {
        if (document.visibilityState === "visible") {
          void loadOrderWithGuard();
        }
      };
      window.addEventListener("focus", loadOrderWithGuard);
      document.addEventListener("visibilitychange", visibilityHandler);
    }

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", loadOrderWithGuard);
        if (visibilityHandler) {
          document.removeEventListener("visibilitychange", visibilityHandler);
        }
      }
    };
  }, [localOrderData, orderNumber]);

  const visibleOrderData = orderData ?? localOrderData;
  const displayOrderNumber = formatDisplayOrderNumber(visibleOrderData?.orderNumber);

  const currentStep = useMemo(() => {
    if (!visibleOrderData) return 0;
    if (visibleOrderData.status === "PREPARING") return 1;
    if (visibleOrderData.status === "READY" || visibleOrderData.status === "COMPLETED") return 2;
    return 0;
  }, [visibleOrderData]);

  useEffect(() => {
    if (!orderNumber) return;

    const nextStatus = currentStep === 0 ? "placed" : currentStep === 1 ? "preparing" : "ready";
    updateOrderStatus(orderNumber, nextStatus);
  }, [currentStep, orderNumber, updateOrderStatus]);

  useEffect(() => {
    if (!visibleOrderData || !onReadyComplete) return;
    if (visibleOrderData.status !== "READY" && visibleOrderData.status !== "COMPLETED") return;

    const timer = setTimeout(() => {
      onReadyComplete();
    }, 1200);

    return () => clearTimeout(timer);
  }, [onReadyComplete, visibleOrderData]);

  const steps = [
    { id: 0, label: "Accepted" },
    { id: 1, label: "Preparing" },
    { id: 2, label: "Ready" },
  ];

  const getIcon = (stepId: number) => {
    switch (stepId) {
      case 0:
        return CheckCircle;
      case 1:
        return ChefHat;
      case 2:
        return Bell;
      default:
        return CheckCircle;
    }
  };

  const itemsCount = visibleOrderData?.items.length ?? 0;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans select-none">
      <div className="px-4 pt-12 pb-4 flex justify-between items-center">
        <button onClick={onBack} className="p-1">
          <ChevronLeft size={28} className="text-gray-700" />
        </button>
        <ReadyOrderBell
          hasNotification={hasReadyOrderNotification}
          ariaLabel="Order notifications"
          popupText="Order is ready"
          buttonClassName="p-2 flex items-center justify-center"
          dotClassName="right-1 top-1"
          popupClassName="right-0"
        >
          <Bell size={24} className="text-gray-700" />
        </ReadyOrderBell>
      </div>

      <div className="flex flex-col items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Order Status</h1>
        <div className="w-24 h-1 bg-orange-400 mt-1 rounded-full" />
      </div>

      <div className="flex-1 px-6 pb-8">
        {!orderPlaced || !orderNumber ? (
          <div className="max-w-sm mx-auto mt-16 border border-orange-200 rounded-[32px] p-6 text-center shadow-sm bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-2">No order yet</h2>
            <p className="text-gray-500 text-sm font-medium">
              Place an order first to track it.
            </p>
          </div>
        ) : isLoading && !visibleOrderData ? (
          <div className="max-w-sm mx-auto mt-16 border border-orange-200 rounded-[32px] p-6 text-center shadow-sm bg-white">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Loading order</h2>
            <p className="text-gray-500 text-sm font-medium">
              We are fetching your tracking details.
            </p>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-center text-gray-400 font-medium">
              We&apos;ll notify you when your order is ready!
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="border border-orange-200 rounded-[32px] p-5 shadow-sm bg-white"
            >
              <div className="flex items-center justify-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {displayOrderNumber ? `Order ${displayOrderNumber}` : "Order placed"}
                  </h2>
                  <p className="text-sm text-gray-500 flex justify-center">
                    {itemsCount} item{itemsCount === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-5">
                {steps.map((step, idx) => {
                  const Icon = getIcon(step.id);
                  const isActive = currentStep === step.id;
                  const isComplete = currentStep > step.id;
                  const iconBgClass =
                    step.id === 0
                      ? "bg-green-500 text-white"
                      : step.id === 1
                        ? isComplete || isActive
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-300"
                        : isComplete || isActive
                          ? "bg-red-500 text-white"
                          : "bg-gray-100 text-gray-300";

                  return (
                    <div key={step.id} className="flex items-start gap-4 relative">
                      {idx < steps.length - 1 && (
                        <div className="absolute left-5 top-10 w-[4px] h-12 bg-gray-300">
                          <div
                            className={`h-full w-full ${
                              step.id === 0 && currentStep >= 1
                                ? "bg-green-500"
                                : step.id === 1 && currentStep >= 2
                                  ? "bg-orange-500"
                                  : ""
                            }`}
                          />
                        </div>
                      )}

                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center z-10 shadow-sm transition-all duration-300 ${iconBgClass}`}
                      >
                        <Icon size={22} strokeWidth={1.8} />
                      </div>

                      <div className="flex flex-col justify-center flex-1">
                        <p className="text-lg font-bold leading-tight text-gray-800">
                          {step.label}
                        </p>
                        <p
                          className={`text-xs font-semibold ${
                            step.id === 0
                              ? "text-green-500"
                              : step.id === 1
                                ? currentStep >= 1
                                  ? "text-orange-500"
                                  : "text-gray-400"
                                : currentStep >= 2
                                  ? "text-red-500"
                                  : "text-gray-400"
                          }`}
                        >
                          {step.id === 0
                            ? "Completed"
                            : step.id === 1
                              ? currentStep >= 1
                                ? "In Progress..."
                                : "Preparing"
                              : currentStep >= 2
                                ? "Ready to serve"
                                : "Ready"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <p className="mt-3 text-center text-sm text-gray-500">
              Estimated time: <span className="font-semibold text-orange-500">{estimatedTime} mins</span>
            </p>
          </div>
        )}
      </div>

      <BottomNav activeView="track" onViewChange={onViewChange} />
    </div>
  );
};

export default TrackOrderPage;
