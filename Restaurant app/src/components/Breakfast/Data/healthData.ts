import oatsBowl from '../../../assets/Breakfast/Health/oats.svg';
import sproutsSalad from '../../../assets/Breakfast/Health/Sprouts.svg';
import greenSmoothie from '../../../assets/Breakfast/Health/Green Smoothie.svg';
import avocadoToast from '../../../assets/Breakfast/Health/Avacado.svg';
import quinoaSalad from '../../../assets/Breakfast/Health/Quino salad.svg';
import grilledChickenSalad from '../../../assets/Breakfast/Health/GrilledChicken.svg';
import boiledEggSalad from '../../../assets/Breakfast/Health/Boiledegg.svg';
import chickenSoup from '../../../assets/Breakfast/Health/chickensoup.svg';
import chickenSandwich from '../../../assets/Breakfast/Health/chickensandwhich.svg';
import type { BreakfastItem } from './BreakfastTypes';

export const healthItems: BreakfastItem[] = [
  {
    id: 42,
    name: 'Oats Bowl',
    description: 'Nutritious Oats With Milk, Fruits, And A Touch Of Honey',
    price: 119,
    image: oatsBowl,
    category: 'Health',
    subCategory: 'Veg',
    isBestseller: false,
  },
  {
    id: 43,
    name: 'Sprouts Salad',
    description: 'Protein-Rich Sprouts Mixed With Fresh Vegetables',
    price: 109,
    image: sproutsSalad,
    category: 'Health',
    subCategory: 'Veg',
    isBestseller: false,
  },
  {
    id: 44,
    name: 'Green Smoothie',
    description: 'Blend Of Spinach, Apple, And Banana For A Healthy Boost',
    price: 139,
    image: greenSmoothie,
    category: 'Health',
    subCategory: 'Veg',
    isBestseller: true,
  },
  {
    id: 45,
    name: 'Avocado Toast',
    description: 'Whole Grain Toast Topped With Creamy Avocado Spread',
    price: 179,
    image: avocadoToast,
    category: 'Health',
    subCategory: 'Veg',
    isBestseller: true,
  },
  {
    id: 46,
    name: 'Quinoa Salad',
    description: 'Healthy Quinoa Mixed With Veggies And Light Dressing',
    price: 199,
    image: quinoaSalad,
    category: 'Health',
    subCategory: 'Veg',
    isBestseller: false,
  },

  {
    id: 51,
    name: 'Grilled Chicken Salad',
    description: 'Grilled Chicken With Fresh Veggies And Light Dressing',
    price: 299,
    image: grilledChickenSalad,
    category: 'Health',
    subCategory: 'Non Veg',
    isBestseller: true,
  },
  {
    id: 52,
    name: 'Boiled Egg Salad',
    description: 'Boiled Eggs With Greens And A Healthy Mix Of Veggies',
    price: 149,
    image: boiledEggSalad,
    category: 'Health',
    subCategory: 'Non Veg',
    isBestseller: false,
  },
  {
    id: 53,
    name: 'Chicken Soup',
    description: 'Crunchy Corn Tossed With Spices And Herbs',
    price: 279,
    image: chickenSoup,
    category: 'Health',
    subCategory: 'Non Veg',
    isBestseller: false,
  },
  {
    id: 54,
    name: 'Chicken Sandwich',
    description: 'Grilled Chicken Sandwich With Whole Grain Bread',
    price: 279,
    image: chickenSandwich,
    category: 'Health',
    subCategory: 'Non Veg',
    isBestseller: true,
  }
];
