
import type { LunchItem } from "./LunchTypes";
 import Butter from "../../../assets/Lunch/Roti/Butter.svg"
 import Naan from "../../../assets/Lunch/Roti/Naan.svg"
 import Paratha from "../../../assets/Lunch/Roti/Paratha.svg"
 import Garlic from "../../../assets/Lunch/Roti/Garlic.svg"
 import Tandoor from "../../../assets/Lunch/Roti/Tandoor.svg"
export const RotiItems: LunchItem[] = [

  {
    id: 51,
    name: 'Butter Roti',
    description: 'Soft Roll With Butter',
    price: 100,
    image: Butter,
    category: 'Roti',
    isBestseller: false,
  },
  {
    id: 52,
    name: 'Naan',
    description: 'Tandoor Baked Soft Bread',
    price: 120,
    image: Naan,
    category: 'Roti',
    isBestseller: false,
  },
  {
    id: 53,
    name: 'Paratha',
    description: 'Layered Crispy Flatbread',
    price: 99,
    image: Paratha,
    category: 'Roti',
    isBestseller: false,
  },
  {
    id: 54,
    name: 'Garlic Naan',
    description: 'Naan With Garlic Flavor',
    price: 177,
    image: Garlic,
    category: 'Roti',
    isBestseller: false,
  },
  {
    id: 55,
    name: 'Tandoori Roti',
    description: 'Whole Wheat Tandoor Bread',
    price: 89,
    image: Tandoor,
    category: 'Roti',
    isBestseller: false,
  }
]