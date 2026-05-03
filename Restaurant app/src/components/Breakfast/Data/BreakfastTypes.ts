export type BreakfastTab = 'All' | 'Bestseller' | 'Beverages' | 'Health' | 'Quick Bites';
export type BeverageTab =
  | 'All'
  | 'Mocktails'
  | 'Cocktails'
  | 'Spirits'
  | 'Beer'
  | 'Wine'
  | 'Hot Beverages'
  | 'Fresh Juice';

  export type HealthTab = 'Veg'| 'Non Veg'
export type SubCategory = BeverageTab | HealthTab;

export interface BreakfastItem {
  id: string | number;
  menuItemId?: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: BreakfastTab;
  subCategory?: SubCategory;
  isBestseller?: boolean;
  likeCount?: number;
  foodType?: "Veg" | "Non Veg";
  mealType?: "Breakfast" | "Lunch" | "Dinner";
}
