import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import arrow from "../../assets/Arrow 1.svg";
import type { FoodType, MealCategory } from "../../types";

type MealVisual = {
  category: MealCategory;
  img: string;
  background: string;
};

interface HomeMealHeroProps {
  foodType: FoodType;
  currentMeal: MealVisual;
  onFoodTypeChange: (type: FoodType) => void;
  onMostPopularSelect: (cat: MealCategory) => void;
  onSelect: (cat: MealCategory) => void;
}

const HomeMealHero: React.FC<HomeMealHeroProps> = ({
  foodType,
  currentMeal,
  onFoodTypeChange,
  onMostPopularSelect,
  onSelect,
}) => {
  return (
    <motion.div
      animate={{ background: currentMeal.background }}
      transition={{ duration: 1.2, ease: "linear" }}
      className="w-full min-h-[550px] md:min-h-[600px] lg:min-h-[650px] xl:min-h-[700px] h-full px-4 sm:px-6 py-6 md:py-8 lg:py-10 flex flex-col"
      style={{ 
        background: currentMeal.background,
        margin: 0,
        paddingBottom: 0,
      }}
    >
      <div className="mb-6 md:mb-8 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-4 md:gap-6">
          <button
            type="button"
            onClick={() => onFoodTypeChange("Veg")}
            className="flex items-center gap-2 text-sm md:text-base font-medium transition-transform hover:scale-105"
          >
            <div
              className={`flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full border-2 ${
                foodType === "Veg" ? "border-green-500" : "border-gray-300"
              }`}
            >
              {foodType === "Veg" && (
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-green-500" />
              )}
            </div>
            Veg
          </button>
          <button
            type="button"
            onClick={() => onFoodTypeChange("Non Veg")}
            className="flex items-center gap-2 text-sm md:text-base font-medium transition-transform hover:scale-105"
          >
            <div
              className={`flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-full border-2 bg-white ${
                foodType === "Non Veg" ? "border-red-500" : "border-gray-300"
              }`}
            >
              {foodType === "Non Veg" && (
                <div className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full bg-red-500" />
              )}
            </div>
            Non Veg
          </button>
        </div>
        <button
          type="button"
          onClick={() => onMostPopularSelect(currentMeal.category)}
          className="rounded-full bg-black px-4 md:px-5 py-1.5 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-wider text-white transition-transform hover:scale-105 shadow-md"
        >
          Most Popular
        </button>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMeal.category}
            initial={{ x: -60, y: 60, opacity: 0, rotate: -45 }}
            animate={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            exit={{ x: 60, y: 60, opacity: 0, rotate: 45 }}
            transition={{
              duration: 0.8,
              ease: [0.4, 0, 0.2, 1],
              x: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
              y: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
            }}
            className="flex w-full flex-col items-center"
          >
            <h2 className="playfair mb-4 md:mb-6 text-[2rem] sm:text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] tracking-tight">
              {currentMeal.category}
            </h2>

            <div className="relative mb-8 md:mb-12 flex h-[240px] w-[240px] sm:h-[280px] sm:w-[280px] md:h-[320px] md:w-[320px] lg:h-[360px] lg:w-[360px] items-center justify-center">
              <motion.img
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.8 }}
                src={currentMeal.img}
                alt={currentMeal.category}
                className="max-h-full max-w-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)]"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => onSelect(currentMeal.category)}
          className="group flex items-center gap-3 rounded-full bg-black px-6 md:px-8 py-2 md:py-3 text-white shadow-2xl transition-all hover:scale-105 hover:shadow-xl"
        >
          <span className="mb-0.5 text-sm md:text-base lg:text-lg font-bold">Explore</span>
          <img src={arrow} alt="arrow" className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </motion.div>
  );
};

export default HomeMealHero;