import idliSambar from '../../../assets/Breakfast/all/idli.svg';
import dosa from '../../../assets/Breakfast/all/dosa.svg';
import fruitSalad from '../../../assets/Breakfast/Health/FruitSalad.svg';
import type { BreakfastItem } from './BreakfastTypes';
import PavBhaji from '../../../assets/Breakfast/all/Pavbhaji.svg'
export const coreItems: BreakfastItem[] = [
  {
    id: 31,
    name: 'Pav Bhaji ',
    description: 'Spicy Mashed Vegetables Served With Buttered Pav',
    price: 150,
    image: PavBhaji,
    category: 'All',
    isBestseller: true,
  },
  {
    id: 32,
    name: 'Idli Sambar',
    description: 'Soft Steamed Idlis Served With Hot Sambar And Coconut Chutney',
    price: 130,
    image: idliSambar,
    category: 'All',
    isBestseller: false,
  },
  {
    id: 33,
    name: 'Dosa',
    description: 'Crispy Dosa Filled With Spiced Potato Filling, Served With Chutney & Sambar',
    price: 130,
    image: dosa,
    category: 'All',
    isBestseller: true,
  },
  {
    id: 34,
    name: 'Fruit Salad',
    description: 'Seasonal Fruits Mixed With Honey And A Hint Of Lemon',
    price: 199,
    image: fruitSalad,
    category: 'All',
    isBestseller: false,
  }
];
