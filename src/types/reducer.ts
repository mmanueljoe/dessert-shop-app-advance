import type { CartState, CartItem } from '@/types/cart'
import type { Dessert } from '@/types/dessert'

export type CartAction =
  | { type: 'ADD_ITEM'; item: Dessert }
  | { type: 'REMOVE_ITEM'; itemName: string; item: CartItem }
  | { type: 'INCREMENT'; item: Dessert }
  | { type: 'DECREMENT'; item: Dessert }
  | { type: 'CLEAR_CART' }

export type CartReducer = (state: CartState, action: CartAction) => CartState
