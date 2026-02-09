import type { Dessert } from './dessert'

export interface CartItem extends Dessert {
  quantity: number
}

export interface CartState {
  items: CartItem[]
  total: number
}
