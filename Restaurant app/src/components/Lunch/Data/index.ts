export * from './LunchTypes'
export * from'./Dessert'
export * from './Maincourse'
export * from './Rice'
export * from './Starters'
export * from './Roti'
export * from './Appetizer'

import { DessertItems } from './Dessert'
import { MainCourseItems } from './Maincourse'
import { RiceItems } from './Rice'
import { StarterItems } from './Starters'
import { RotiItems } from './Roti'
import { AppetizerItems } from './Appetizer'

export const LunchItems  = [
    ...DessertItems,
    ...MainCourseItems,
    ...RiceItems,
    ...StarterItems,
    ...RotiItems,
    ...AppetizerItems
]
