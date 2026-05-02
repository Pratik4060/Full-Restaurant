import type { HomeOffer } from "../components/home/types";
import type { FoodType, MealCategory } from "../types";
import type { BeverageTab, BreakfastItem, BreakfastTab, HealthTab } from "../components/Breakfast/Data";
import type { LunchItem, LunchTab } from "../components/Lunch/Data";
import type { PublicMenuItem, PublicOffer } from "../services/restaurantApi";

const gradients = [
  "linear-gradient(117.14deg, #785641 5.65%, #5F0404 96.69%)",
  "linear-gradient(114.35deg, #2A460D 0.77%, #666666 97.98%)",
  "linear-gradient(115.74deg, #970808 4.97%, #053F62 100%)",
  "linear-gradient(115.68deg, #446B83 1.81%, #116848 100%)",
];

const lunchCategories: LunchTab[] = [
  "All",
  "Appetizer",
  "Main Course",
  "Roti",
  "Rice",
  "Bestseller",
  "Beverages",
  "Dessert",
];

const toFoodType = (diet: PublicMenuItem["diet"]): FoodType | undefined => {
  if (diet === "NON_VEG") return "Non Veg";
  if (diet === "VEG") return "Veg";
  return undefined;
};

const dedupe = <T extends { name: string; category?: string; subCategory?: string; foodType?: string }>(items: T[]) => {
  const map = new Map<string, T>();
  for (const item of items) {
    const key = `${item.name}-${item.category ?? ""}-${item.subCategory ?? ""}-${item.foodType ?? ""}`;
    if (!map.has(key)) map.set(key, item);
  }
  return [...map.values()];
};

export const mapOffersToHomeOffers = (offers: PublicOffer[], fallback: HomeOffer[]) => {
  if (offers.length === 0) return fallback;
  return offers.map((offer, index) => ({
    title: offer.title,
    desc: `${offer.description} ${offer.discountText}`.trim(),
    img: offer.imageUrl || fallback[index % fallback.length]?.img || "",
    gradient: gradients[index % gradients.length],
  }));
};

export const mapPublicBreakfastItems = (items: PublicMenuItem[]): BreakfastItem[] =>
  dedupe(
    items
      .filter((item) => item.type === "BREAKFAST" || item.category === "Beverages")
      .map((item) => ({
        id: item.id,
        menuItemId: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.imageUrl || "",
        category: (
          item.category === "Beverages" ||
          item.category === "Health" ||
          item.category === "Quick Bites"
            ? item.category
            : item.isBestseller
              ? "Bestseller"
              : "All"
        ) as BreakfastTab,
        subCategory: item.subCategory as BeverageTab | HealthTab | undefined,
        isBestseller: item.isBestseller,
        foodType: toFoodType(item.diet),
        mealType: "Breakfast" as MealCategory,
      }))
  );

export const mapPublicLunchItems = (items: PublicMenuItem[], mealType: MealCategory): LunchItem[] =>
  dedupe(
    items
      .filter((item) => item.type === "LUNCH" || item.type === "DINNER" || item.category === "Beverages")
      .map((item) => ({
        id: item.id,
        menuItemId: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.imageUrl || "",
        category: (
          lunchCategories.includes(item.category as LunchTab)
            ? item.category
            : item.isBestseller
              ? "Bestseller"
              : "All"
        ) as LunchTab,
        subCategory: item.subCategory as BeverageTab | undefined,
        isBestseller: item.isBestseller,
        foodType: toFoodType(item.diet),
        mealType,
      }))
  );
