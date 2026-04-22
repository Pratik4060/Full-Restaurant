import type { LunchItem } from "./LunchTypes";
import paneerButter from "../../../assets/Lunch/Maincourse/PaneerButter.svg"
import vegBiryani from "../../../assets/Lunch/Maincourse/VegBiryani.svg"
import vegThali  from "../../../assets/Lunch/Maincourse/Vegthali.svg"
import MixVegCurry from "../../../assets/Lunch/Maincourse/MixVegCuryy.svg"
import GrilledPaneer from "../../../assets/Lunch/Maincourse/GrilledPaneer.svg"
import butterChicken from "../../../assets/Lunch/Maincourse/ButterChicken.svg"
import chickenCurry from "../../../assets/Lunch/Maincourse/ChickenCurry.svg"
import muttonCurry from "../../../assets/Lunch/Maincourse/MuttonCurry.svg"
import fishCurry from "../../../assets/Lunch/Maincourse/FIshCurry.svg"
import eggCurry from "../../../assets/Lunch/Maincourse/EggCurry.svg"

export const MainCourseItems: LunchItem[] = [
  {
    id: 1,
    name: "Paneer Butter Masala",
    description: "Creamy Tomato Gravy With Soft Paneer",
    price: 239,
    image: paneerButter,
    category: "Main Course",
    isBestseller: true,
    foodType: "Veg",
  },
  {
    id: 2,
    name: "Veg Biryani",
    description: "Aromatic Rice With Mixed Vegetables",
    price: 199,
    image: vegBiryani,
    category: "Main Course",
    isBestseller: false,
    foodType: "Veg",
  },
  {
    id: 3,
    name: "Veg Thali",
    description: "Complete Meal With Roti, Sabzi, Dal & Rice",
    price: 199,
    image: vegThali,
    category: "Main Course",
    isBestseller: true,
    foodType: "Veg",
  },

  {
    id: 4,
    name: "Mix veg Curry ",
    description: "Complete Meal With Roti, Sabzi, Dal & Rice",
    price: 199,
    image: MixVegCurry,
    category: "Main Course",
    isBestseller: true,
    foodType: "Veg",
  },
  {
    id: 5,
    name: "Grilled Paneer Salad",
    description: "Complete Meal With Roti, Sabzi, Dal & Rice",
    price: 199,
    image: GrilledPaneer,
    category: "Main Course",
    isBestseller: true,
    foodType: "Veg",
  },
  {
    id: 71,
    name: "Butter Chicken",
    description: "Creamy rich mildly spiced curry",
    price: 249,
    image: butterChicken,
    category: "Main Course",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 72,
    name: "Chicken Curry",
    description: "Traditional spicy chicken gravy",
    price: 229,
    image: chickenCurry,
    category: "Main Course",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 73,
    name: "Mutton Curry",
    description: "Rich and flavorful mutton curry",
    price: 199,
    image: muttonCurry,
    category: "Main Course",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 74,
    name: "Fish Curry",
    description: "Coastal style fish in tangy gravy",
    price: 179,
    image: fishCurry,
    category: "Main Course",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 75,
    name: "Egg Curry",
    description: "Boiled eggs in spiced gravy",
    price: 189,
    image: eggCurry,
    category: "Main Course",
    isBestseller: false,
    foodType: "Non Veg",
  },
];
