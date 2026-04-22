import type { BreakfastItem } from './BreakfastTypes.ts';

import freshorange from "../../../assets/Beverages/Fresh Juices/OrangeJuice.svg";
import mango from "../../../assets/Beverages/Fresh Juices/AlphansoMango.svg";
import berrySmoothie from "../../../assets/Beverages/Fresh Juices/BerryBlast.svg";
import avocadoSmoothie from "../../../assets/Beverages/Fresh Juices/Avacado.svg";
import watermelonJuice from "../../../assets/Beverages/Fresh Juices/Watermelon.svg";

import blueLagoon from "../../../assets/Beverages/Mocktails/BlueLagoon.svg";
import fruitPunch from "../../../assets/Beverages/Mocktails/FruitPunch.svg";
import lemonMint from "../../../assets/Beverages/Mocktails/LemonMint.svg";
import virginMojito from "../../../assets/Beverages/Mocktails/VirginMojito.svg";

import margarita from "../../../assets/Beverages/Cocktails/Margarita.svg";
import mojito from "../../../assets/Beverages/Cocktails/mojito.svg";
import cosmopolitan from "../../../assets/Beverages/Cocktails/CosmoPoliton.svg";
import pinaColada from "../../../assets/Beverages/Cocktails/pinacolada.svg";

import whiskey from "../../../assets/Beverages/Spirits/Whiskey.svg";
import vodka from "../../../assets/Beverages/Spirits/Vodka.svg";
import rum from "../../../assets/Beverages/Spirits/Rum.svg";
import gin from "../../../assets/Beverages/Spirits/Gin.svg";

import lager from "../../../assets/Beverages/Beer/lager.svg";
import strongBeer from "../../../assets/Beverages/Beer/Strong Beer.svg";
import craftBeer from "../../../assets/Beverages/Beer/CraftBeer.svg";

import redWine from "../../../assets/Beverages/Wine/RedWine.svg";
import whiteWine from "../../../assets/Beverages/Wine/Whitewine.svg";
import roseWine from "../../../assets/Beverages/Wine/Rose.svg";

import tea from "../../../assets/Beverages/Hot Beverages/Tea.svg";
import greenTea from "../../../assets/Beverages/Hot Beverages/Greentea.svg";
import coffee from "../../../assets/Beverages/Hot Beverages/Coffe.svg";

export const beverageItems: BreakfastItem[] = [
  // Juices & Smoothies
  {
    id: 1,
    name: 'Fresh Orange Juice',
    description: 'Freshly Squeezed Orange Juice Served Chilled',
    price: 149,
    image: freshorange,
    category: 'Beverages',
    subCategory: 'Fresh Juice',
    isBestseller: true,
  },
  {
    id: 2,
    name: 'Alphonso Mango Juice',
    description: 'Fresh Coffee With Buttery Croissants',
    price: 179,
    image: mango,
    category: 'Beverages',
    subCategory: 'Fresh Juice',
    isBestseller: false,
  },
  {
    id: 3,
    name: 'Berry Blast Smoothie',
    description: 'Blend Of Fresh Berries With Yogurt For A Refreshing Taste',
    price: 199,
    image: berrySmoothie,
    category: 'Beverages',
    subCategory: 'Fresh Juice',
    isBestseller: true
  },
  {
    id: 4,
    name: 'Avocado Smoothie',
    description: 'Creamy Avocado Blended With Milk And Honey',
    price: 299,
    image: avocadoSmoothie,
    category: 'Beverages',
    subCategory: 'Fresh Juice',
  },
  {
    id: 26,
    name: 'WaterMelon Juice',
    description: 'Cold and Hydrating Fresh Juice',
    price: 490,
    image: watermelonJuice,
    category: 'Beverages',
    subCategory: 'Fresh Juice',

  },

  // Mocktails
  {
    id: 5,
    name: 'Mojito (Virgin)',
    description: 'Minty Lime Drink Fresh & Refreshing',
    price: 149,
    image: virginMojito,
    category: 'Beverages',
    subCategory: 'Mocktails',
    isBestseller: true,
  },
  {
    id: 6,
    name: 'Blue Lagoon',
    description: 'Sweet Citrus Drink With A Cool Blue Twist',
    price: 179,
    image: blueLagoon,
    category: 'Beverages',
    subCategory: 'Mocktails',
  },
  {
    id: 7,
    name: 'Fruit Punch',
    description: 'Mixed Fruit Drink, Sweet And Tangy',
    price: 199,
    image: fruitPunch,
    category: 'Beverages',
    subCategory: 'Mocktails',
  },
  {
    id: 8,
    name: 'Lemon Mint Cooler',
    description: 'Light Lemon Drink With Fresh Mint',
    price: 299,
    image: lemonMint,
    category: 'Beverages',
    subCategory: 'Mocktails',
  },

  // Cocktails
  {
    id: 9,
    name: 'Margarita',
    description: 'Tangy Lime Cocktail With A Salted Rim',
    price: 169,
    image: margarita,
    category: 'Beverages',
    subCategory: 'Cocktails',
    isBestseller: true,
  },
  {
    id: 10,
    name: 'Mojito',
    description: 'Classic Mint And Lime Cocktail',
    price: 159,
    image: mojito,
    category: 'Beverages',
    subCategory: 'Cocktails',
  },
  {
    id: 11,
    name: 'Cosmopolitan',
    description: 'Smooth Cranberry Cocktail With Citrus Notes',
    price: 129,
    image: cosmopolitan,
    category: 'Beverages',
    subCategory: 'Cocktails',
  },
  {
    id: 12,
    name: 'Pina Colada',
    description: 'Creamy Coconut And Pineapple Blend',
    price: 149,
    image: pinaColada,
    category: 'Beverages',
    subCategory: 'Cocktails',
    isBestseller: true,
  },

  // Spirits
  {
    id: 13,
    name: 'Whiskey',
    description: 'Strong And Smooth Aged Spirit',
    price: 149,
    image: whiskey,
    category: 'Beverages',
    subCategory: 'Spirits',
  },
  {
    id: 14,
    name: 'Vodka',
    description: 'Clear And Clean With A Crisp Taste',
    price: 179,
    image: vodka,
    category: 'Beverages',
    subCategory: 'Spirits',
  },
  {
    id: 15,
    name: 'Rum',
    description: 'Mixed Fruit Drink, Sweet And Tangy',
    price: 199,
    image: rum,
    category: 'Beverages',
    subCategory: 'Spirits',
  },
  {
    id: 16,
    name: 'Gin',
    description: 'Herbal Spirit With Botanical Flavors',
    price: 299,
    image: gin,
    category: 'Beverages',
    subCategory: 'Spirits',
    isBestseller: true,
  },

  // Beer
  {
    id: 17,
    name: 'Lager',
    description: 'Light, Crisp And Refreshing Beer',
    price: 149,
    image: lager,
    category: 'Beverages',
    subCategory: 'Beer',
  },
  {
    id: 18,
    name: 'Strong Beer',
    description: 'Bold And Clean With A Crisp Taste',
    price: 179,
    image: strongBeer,
    category: 'Beverages',
    subCategory: 'Beer',
  },
  {
    id: 19,
    name: 'Craft Beer',
    description: 'Unique Flavors With Rich Taste',
    price: 199,
    image: craftBeer,
    category: 'Beverages',
    subCategory: 'Beer',
    isBestseller: true,
  },

  // Wine
  {
    id: 20,
    name: 'Red Wine',
    description: 'Rich And Bold With Deep Flavors',
    price: 400,
    image: redWine,
    category: 'Beverages',
    subCategory: 'Wine',
    isBestseller: true,
  },
  {
    id: 21,
    name: 'White Wine',
    description: 'Light And Crisp With Citrus Notes',
    price: 450,
    image: whiteWine,
    category: 'Beverages',
    subCategory: 'Wine',
  },
  {
    id: 22,
    name: 'Rose',
    description: 'Fresh And Slightly Sweet Wine',
    price: 400,
    image: roseWine,
    category: 'Beverages',
    subCategory: 'Wine',
  },

  // Tea & Coffee
  {
    id: 23,
    name: 'Tea',
    description: 'Fresh Brewed Chai With Aroma',
    price: 40,
    image: tea,
    category: 'Beverages',
    subCategory: 'Hot Beverages',
    isBestseller: true,
  },
  {
    id: 24,
    name: 'Coffee',
    description: 'Strong And Energizing Hot Drink',
    price: 90,
    image: coffee,
    category: 'Beverages',
    subCategory: 'Hot Beverages',
    isBestseller: true,
  },
  {
    id: 25,
    name: 'Green Tea',
    description: 'Light And Healthy Herbal Tea',
    price: 40,
    image: greenTea,
    category: 'Beverages',
    subCategory: 'Hot Beverages',
  }


];
