import React, { useEffect, useRef, useState } from "react";

interface ReadyOrderBellProps {
  hasNotification: boolean;
  ariaLabel: string;
  popupText?: string;
  children: React.ReactNode;
  buttonClassName?: string;
  popupClassName?: string;
  dotClassName?: string;
}

const ReadyOrderBell: React.FC<ReadyOrderBellProps> = ({
  hasNotification,
  ariaLabel,
  popupText = "Order is ready",
  children,
  buttonClassName = "",
  popupClassName = "",
  dotClassName = "",
}) => {
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasNotification) {
      setIsPopupVisible(false);
    }
  }, [hasNotification]);

  const showPopup = () => {
    if (!hasNotification) return;

    setIsPopupVisible(true);
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = window.setTimeout(() => {
      setIsPopupVisible(false);
    }, 2500);
  };

  return (
    <button
      type="button"
      onClick={showPopup}
      className={`relative ${buttonClassName}`}
      aria-label={ariaLabel}
    >
      {children}

      {hasNotification ? (
        <span
          className={`absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-[#ff4d4f] ring-2 ring-white ${dotClassName}`}
        />
      ) : null}

      {isPopupVisible ? (
        <div
          className={`absolute right-0 top-12 z-30 min-w-[160px] rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-[0_16px_40px_rgba(0,0,0,0.16)] ${popupClassName}`}
          role="status"
          aria-live="polite"
        >
          {popupText}
        </div>
      ) : null}
    </button>
  );
};

export default ReadyOrderBell;
