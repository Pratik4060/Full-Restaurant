import type { LunchItem } from "./LunchTypes";
import chickenTikka from "../../../assets/Lunch/Appetizer/Chickentikka.svg";
import chickenLollipop from "../../../assets/Lunch/Appetizer/ChickenLolipop.svg";
import fishFry from "../../../assets/Lunch/Appetizer/FishFry.svg";

export const AppetizerItems: LunchItem[] = [
  {
    id: 81,
    name: "Chicken Tikka",
    description: "Grilled chicken with smoky flavor",
    price: 199,
    image: chickenTikka,
    category: "Appetizer",
    isBestseller: true,
    foodType: "Non Veg",
  },
  {
    id: 82,
    name: "Chicken Lollipop",
    description: "Crispy fried chicken wings",
    price: 199,
    image: chickenLollipop,
    category: "Appetizer",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 83,
    name: "Fish Fry",
    description: "Crispy fried fish with spices",
    price: 249,
    image: fishFry,
    category: "Appetizer",
    isBestseller: false,
    foodType: "Non Veg",
  },
];
