import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import bell from "../../assets/bell.svg";
import logo1 from "../../assets/logo1.svg";
import arrow from "../../assets/Arrow 1.svg";
import { useOrder } from "../../contexts/OrderContext";
import ReadyOrderBell from "../ui/ReadyOrderBell";
import type { HomeOffer } from "./types";

interface HomeOfferCarouselProps {
  offers: HomeOffer[];
  currentOffer: number;
  onOfferChange: (index: number) => void;
  onInfoOpen: () => void;
  onOrderNow: () => void;
  onReadyOrderClick?: () => void;
  children: React.ReactNode;
}

const HomeOfferCarousel: React.FC<HomeOfferCarouselProps> = ({
  offers,
  currentOffer,
  onOfferChange,
  onInfoOpen,
  onOrderNow,
  onReadyOrderClick,
  children,
}) => {
  const { hasReadyOrderNotification } = useOrder();
  const hasOffers = offers.length > 0;
  const activeOfferIndex = hasOffers ? currentOffer % offers.length : 0;
  const activeOffer = hasOffers ? offers[activeOfferIndex] : null;

  return (
    <motion.div
      animate={{ background: activeOffer?.gradient ?? "#785641" }}
      transition={{ duration: 0.8, ease: "linear" }}
      className="px-6 pb-6 pt-6 text-white"
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={onInfoOpen}
          className="flex h-14 w-14 items-center justify-center"
        >
          <img src={logo1} alt="Zohnix" className="h-19 w-19 object-contain" />
        </button>
        <ReadyOrderBell
          hasNotification={hasReadyOrderNotification}
          ariaLabel="Order notifications"
          popupText="Order is ready"
          buttonClassName="flex items-center justify-center"
          popupClassName="text-gray-800"
          onNotificationClick={onReadyOrderClick}
        >
          <img src={bell} className="h-8 w-8" alt="notifications" />
        </ReadyOrderBell>
      </div>

      {children}

      {activeOffer ? (
        <>
          <div className="relative h-[200px] md:h-[260px] lg:h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeOfferIndex}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -40, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-0 flex items-center justify-between"
              >
                <div className="flex-1 pr-4">
                  <p className="playfair mb-2 text-[1.45rem] font-bold tracking-tight">
                    {activeOffer.title}
                  </p>
                  <p className="max-w-[240px] text-sm leading-relaxed text-white/90">
                    {activeOffer.desc}
                  </p>
                  <button
                    type="button"
                    onClick={onOrderNow}
                    className="mt-5 flex items-center gap-3 rounded-xl bg-[linear-gradient(90deg,#BC9F76_0%,#64471E_100%)] px-5 py-2 text-md text-white"
                  >
                    <span className="mb-1">Order Now</span>
                    <img
                      src={arrow}
                      alt="arrow"
                      className="h-4 w-6 object-contain"
                    />
                  </button>
                </div>

                {activeOffer.img ? (
                  <div className="flex h-[120px] w-[120px] md:h-[160px] md:w-[160px]">
                    <img
                      src={activeOffer.img}
                      className="h-full w-full object-contain drop-shadow-2xl"
                      alt="food"
                    />
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {offers.length > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              {offers.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onOfferChange(index)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    index === activeOfferIndex ? "bg-[#ffb100]" : "bg-white/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </motion.div>
  );
};

export default HomeOfferCarousel;
