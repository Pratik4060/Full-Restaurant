import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Individual Animated Icon Components ---

const JuiceIcon = () => (
  <div className="relative">
    {/* The Straw - Wiggles independently */}
    <motion.div
      animate={{ rotate: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className="absolute -top-8 left-10 origin-bottom"
    >
      <svg width="20" height="40" viewBox="0 0 20 40">
        <path
          d="M5 40 L5 10 L15 5"
          stroke="#6B7280"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
    {/* The Glass and Orange */}
    <div className="flex items-end">
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        <svg width="50" height="50" viewBox="0 0 100 100">
          <circle cx="50" cy="60" r="35" fill="#F39200" />
          <path d="M50 25 L40 10 Q50 5 60 10 Z" fill="#22C55E" />
        </svg>
      </motion.div>
      <svg width="80" height="100" viewBox="0 0 80 100">
        <path d="M10 0 H70 L60 100 H20 Z" fill="#0099FF" />
      </svg>
    </div>
  </div>
);

const BowlIcon = () => (
  <div className="relative">
    {/* Floating Toppings */}
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className="absolute top-2 left-6"
    >
      <div className="w-6 h-6 rounded-full bg-teal-400 opacity-80" />
    </motion.div>
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{
        repeat: Infinity,
        duration: 2,
        delay: 0.5,
        ease: "easeInOut",
      }}
      className="absolute top-2 right-8"
    >
      <div className="w-8 h-5 rounded-sm bg-orange-400 rotate-12" />
    </motion.div>
    {/* The Bowl */}
    <svg width="120" height="80" viewBox="0 0 120 80">
      <path
        d="M5 5 H115 Q115 75 60 75 Q5 75 5 5 Z"
        fill="none"
        stroke="#374151"
        strokeWidth="6"
      />
      <rect x="45" y="75" width="30" height="6" rx="3" fill="#374151" />
    </svg>
  </div>
);

const SushiIcon = () => (
  <div className="relative flex items-center justify-center">
    {/* Chopsticks - Wiggling action */}
    <motion.div
      animate={{ rotate: [-2, 2, -2] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="absolute"
    >
      <svg width="120" height="120" viewBox="0 0 100 100">
        <line
          x1="10"
          y1="80"
          x2="90"
          y2="20"
          stroke="#A88164"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="90"
          x2="95"
          y2="40"
          stroke="#A88164"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
    {/* Sushi Roll */}
    <div className="w-16 h-16 rounded-full border-4 border-gray-700 bg-white flex items-center justify-center">
      <div className="w-8 h-8 rounded-full bg-red-400" />
    </div>
  </div>
);


// Placeholder for Pizza to keep code clean
const PizzaIcon = () => (
  <motion.div
    animate={{ rotate: [0, 5, 0] }}
    transition={{ repeat: Infinity, duration: 4 }}
  >
    <svg width="100" height="100" viewBox="0 0 100 100">
      <path d="M10 80 Q50 90 90 80 L50 10 Z" fill="#F97316" />
      <path d="M18 75 Q50 82 82 75 L50 20 Z" fill="#FBAD51" />
      <circle cx="45" cy="60" r="5" fill="#BE123C" />
      <circle cx="58" cy="50" r="4" fill="#BE123C" />
    </svg>
  </motion.div>
);

const COMPONENTS = [<PizzaIcon />, <SushiIcon />, <JuiceIcon />, <BowlIcon />];

const LoadingAnim = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % COMPONENTS.length);
    }, 700); // Slower transition for a more "premium" feel
    return () => clearInterval(interval);
  }, []);

return (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center">
    {/* Fixed container for icons */}
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Background Ring - Optional, adds a "Loading" feel */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-dashed border-orange-100 rounded-full"
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ scale: 0.5, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 1.3, opacity: 0, y: -15 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="absolute flex items-center justify-center"
        >
          {COMPONENTS[index]}
        </motion.div>
      </AnimatePresence>
    </div>

    <motion.p
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="mt-8 text-gray-400 font-bold tracking-[0.2em] text-[10px] uppercase"
    >
      Preparing your experience...
    </motion.p>
  </div>
);
};

export default LoadingAnim;
