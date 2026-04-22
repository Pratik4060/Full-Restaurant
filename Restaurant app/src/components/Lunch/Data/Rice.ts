import type { LunchItem } from "./LunchTypes";
import JeeraRice from "../../../assets/Lunch/Rice/JeeraRice.svg"
import Pulao from "../../../assets/Lunch/Rice/Pulao.svg"
import CurdRice from "../../../assets/Lunch/Rice/CurdRice.svg"
import steamRice from "../../../assets/Lunch/Rice/steamRice.svg"
import VegBiryani from "../../../assets/Lunch/Rice/VegBiryani.svg"
import chickenBiryani from "../../../assets/Lunch/Rice/ChickenBiryani.svg"
import muttonBiryani from "../../../assets/Lunch/Rice/MuttonBiryani.svg"
import eggBiryani from "../../../assets/Lunch/Rice/EggBiryani.svg"
import chickenPulao from "../../../assets/Lunch/Rice/ChickenPulao.svg"

export const RiceItems: LunchItem[] = [
  {
    id: 21,
    name: "Jeera Rice",
    description: "Cumin Flavored Basmati Rice",
    price: 239,
    image: JeeraRice,
    category: "Rice",
    isBestseller: true,
    foodType: "Veg",
  },
  {
    id: 22,
    name: "Veg Biryani",
    description: "Spiced Rice With Vegetables",
    price: 199,
    image: VegBiryani,
    category: "Rice",
    isBestseller: false,
    foodType: "Veg",
  },
  {
    id: 23,
    name: "Steam Rice",
    description: "Plain Soft Cooked Rice",
    price: 199,
    image: steamRice,
    category: "Rice",
    isBestseller: false,
    foodType: "Veg",
  },
  {
    id: 24,
    name: "Pulao",
    description: "Mildly Spiced Vegetable Rice",
    price: 199,
    image: Pulao,
    category: "Rice",
    isBestseller: false,
    foodType: "Veg",
  },
  {
    id: 25,
    name: "Curd Rice",
    description: "Rice Mixed With Yogurt",
    price: 199,
    image: CurdRice,
    category: "Rice",
    isBestseller: false,
    foodType: "Veg",
  },
  {
    id: 90,
    name: "Chicken Biryani",
    description: "Aromatic rice with spicy chicken",
    price: 229,
    image: chickenBiryani,
    category: "Rice",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 91,
    name: "Mutton Biryani",
    description: "Rich and flavorful biryani",
    price: 299,
    image: muttonBiryani,
    category: "Rice",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 92,
    name: "Steam Rice",
    description: "Plain boiled cooked rice",
    price: 99,
    image: steamRice,
    category: "Rice",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 93,
    name: "Egg Biryani",
    description: "Spiced rice with boiled eggs",
    price: 199,
    image: eggBiryani,
    category: "Rice",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 94,
    name: "Chicken Pulao",
    description: "Mildly spiced rice with chicken",
    price: 209,
    image: chickenPulao,
    category: "Rice",
    isBestseller: false,
    foodType: "Non Veg",
  },
];
