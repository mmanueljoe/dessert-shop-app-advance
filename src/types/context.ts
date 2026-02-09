import type { CartState, CartItem } from '@/types/cart'
import type { Dessert } from '@/types/dessert'

export interface CartContextValue {
  cart: CartState
  addItem: (item: Dessert) => void
  removeItem: (item: CartItem) => void
  increment: (item: Dessert) => void
  decrement: (item: Dessert) => void
  clearCart: () => void
}
