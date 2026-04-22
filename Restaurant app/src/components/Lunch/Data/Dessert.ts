import type { LunchItem } from "./LunchTypes";
import Brownie from "../../../assets/Lunch/Dessert/Brownie.svg"
import Gulabjam from "../../../assets/Lunch/Dessert/Gulabjam.svg"
import Icecream from "../../../assets/Lunch/Dessert/Icecream.svg"
import Kheer from "../../../assets/Lunch/Dessert/Kheer.svg"
import Rasgulla from "../../../assets/Lunch/Dessert/Rasgulla.svg"




export const DessertItems:LunchItem[] = [
  {
    id: 31,
    name: 'Gulab Jamun',
    description: 'Soft Sweet Balls In Syrup',
    price: 249,
    image:Gulabjam,
    category: 'Dessert',
    isBestseller: true,
  },
  {
    id: 32,
    name: 'Rasgulla',
    description: 'Spongy Sweet In Sugar Syrup',
    price: 269,
    image: Rasgulla,
    category: 'Dessert',
    isBestseller: false,
  },
  {
    id: 33,
    name: 'Ice Cream',
    description: 'Chilled Creamy Dessert',
    price: 229,
    image: Icecream,
    category: 'Dessert',
    isBestseller: false,
  },
  {
    id: 34,
    name: 'Kheer',
    description: 'Rice Pudding With Milk & Nuts',
    price: 229,
    image: Kheer,
    category: 'Dessert',
    isBestseller: false,
  },
  {
    id: 35,
    name: 'Brownie',
    description: 'Chocolate Dessert Served Warm',
    price: 229,
    image: Brownie,
    category: 'Dessert',
    isBestseller: true,
  }
];