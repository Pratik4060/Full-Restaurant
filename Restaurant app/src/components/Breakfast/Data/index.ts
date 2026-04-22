export * from './BreakfastTypes';
export * from './coreData';
export * from './beveragesData';
export * from './healthData';
export * from './quickBitesData';

import { coreItems } from './coreData';
import { beverageItems } from './beveragesData';
import { healthItems } from './healthData';
import { quickBiteItems } from './quickBitesData';

export const BreakfastItems = [
  ...coreItems,
  ...beverageItems,
  ...healthItems,
  ...quickBiteItems,
];
