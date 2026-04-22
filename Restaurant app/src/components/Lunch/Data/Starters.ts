import type { LunchItem } from "./LunchTypes";
import Crispy from "../../../assets/Lunch/Starters/Crispy.svg"
import kabab from "../../../assets/Lunch/Starters/kabab.svg"
import Paneertikka from "../../../assets/Lunch/Starters/Paneertikka.svg"
import springrolls from "../../../assets/Lunch/Starters/springrolls.svg"
export const StarterItems :LunchItem[] = [
  {
    id: 11,
    name: 'Paneer Tikka',
    description: 'Grilled Paneer With Smoky Flavors',
    price: 239,
    image: Paneertikka,
    category: 'Starters',
    isBestseller: true,
  },
  {
    id: 12,
    name: 'Veg Seekh Kebab',
    description: 'Spiced Veggie Kebabs',
    price: 199,
    image: kabab,
    category: 'Starters',
    isBestseller: false,
  },
  {
    id: 13,
    name: 'Crispy Corn',
    description: 'Crunchy Corn With Spices',
    price: 199,
    image: Crispy,
    category: 'Starters',
    isBestseller: false,
  },
  {
    id: 14,
    name: 'Spring Rolls',
    description: 'Veg-Filled Crispy Rolls',
    price: 199,
    image: springrolls,
    category: 'Starters',
    isBestseller: false,
  }
];