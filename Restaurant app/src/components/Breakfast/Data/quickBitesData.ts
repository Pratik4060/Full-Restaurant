import frenchFries from '../../../assets/Breakfast/Quick Bites/crispy frenchfries.svg';
import cheeseBalls from '../../../assets/Breakfast/Quick Bites/cheeseballs.svg';
import crispyCorn from '../../../assets/Breakfast/Quick Bites/crispycom.svg';
import vegSandwich from '../../../assets/Breakfast/Quick Bites/GrilledVeg.svg';
import croissant from '../../../assets/Breakfast/Quick Bites/buttercroissant.svg';
import chickenPuff from '../../../assets/Breakfast/Quick Bites/ChickenPuff.svg';
import chickenNuggets from '../../../assets/Breakfast/Quick Bites/Chicken Nuggets.svg';
import chickenPopcorn from '../../../assets/Breakfast/Quick Bites/Chickenpopcorn.svg';
import eggSandwich from '../../../assets/Breakfast/Quick Bites/EggSandwhich.svg';
import chickenRoll from '../../../assets/Breakfast/Quick Bites/ChickenRoll.svg';
import type { BreakfastItem } from './BreakfastTypes';

export const quickBiteItems: BreakfastItem[] = [
  {
    id: 61,
    name: "Crispy French Fries",
    description: "Golden Fried Potato Fries With Light Seasoning",
    price: 99,
    image: frenchFries,
    category: "Quick Bites",
    isBestseller: true,
  },
  {
    id: 62,
    name: "Cheese Balls",
    description: "Crispy Fried Balls Filled With Melted Cheese",
    price: 129,
    image: cheeseBalls,
    category: "Quick Bites",
    isBestseller: false,
  },
  {
    id: 63,
    name: "Crispy Corn",
    description: "Crunchy Corn Tossed With Spices And Herbs",
    price: 119,
    image: crispyCorn,
    category: "Quick Bites",
    isBestseller: false,
  },
  {
    id: 64,
    name: "Grilled Veg Sandwich",
    description: "Toasted Sandwich With Fresh Veggies And Sauces",
    price: 279,
    image: vegSandwich,
    category: "Quick Bites",
    isBestseller: true,
  },
  {
    id: 65,
    name: "Butter Croissant",
    description: "Flaky And Buttery Baked Croissant",
    price: 99,
    image: croissant,
    category: "Quick Bites",
    isBestseller: true,
  },
  {
    id: 151,
    name: "Chicken Puff",
    description: "Flaky pastry filled with spicy chicken stuffing",
    price: 149,
    image: chickenPuff,
    category: "Quick Bites",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 152,
    name: "Chicken Nuggets",
    description: "Crispy fried chicken bites, juicy inside",
    price: 129,
    image: chickenNuggets,
    category: "Quick Bites",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 153,
    name: "Chicken Popcorn",
    description: "Crunchy bite-sized chicken pieces",
    price: 139,
    image: chickenPopcorn,
    category: "Quick Bites",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 154,
    name: "Egg Sandwich",
    description: "Simple egg filling in toasted bread",
    price: 89,
    image: eggSandwich,
    category: "Quick Bites",
    isBestseller: false,
    foodType: "Non Veg",
  },
  {
    id: 155,
    name: "Chicken Roll",
    description: "Spiced chicken wrapped in soft roti",
    price: 129,
    image: chickenRoll,
    category: "Quick Bites",
    isBestseller: false,
    foodType: "Non Veg",
  },
];
