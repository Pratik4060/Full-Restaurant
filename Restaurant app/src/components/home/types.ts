export type HomeSearchItem = {
  id: string | number;
  menuItemId?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  foodType?: "Veg" | "Non Veg";
  source: "Breakfast" | "Lunch" | "Dinner";
  category?: string;
  subCategory?: string;
  mealType?: "Breakfast" | "Lunch" | "Dinner";
  isBestseller?: boolean;
};

export type HomeOffer = {
  title: string;
  desc: string;
  img: string;
  gradient: string;
};
