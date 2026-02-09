import type { CartState, CartItem } from '@/types/cart'
import type { Dessert } from '@/types/dessert'
import { type CartAction } from '@/types/reducer'

export const ADD_ITEM = 'ADD_ITEM'
export const REMOVE_ITEM = 'REMOVE_ITEM'
export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT'
export const CLEAR_CART = 'CLEAR_CART'

export const initialCart: CartState = { items: [], total: 0 }

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case ADD_ITEM: {
      const existingItem = state.items.find(item => item.name === action.item.name)

      if (existingItem) {
        return {
          items: state.items.map(item =>
            item.name === action.item.name ? { ...item, quantity: item.quantity + 1 } : item,
          ),
          total: state.total + action.item.price,
        }
      }
      return {
        items: [...state.items, { ...action.item, quantity: 1 }],
        total: state.total + action.item.price,
      }
    }

    case REMOVE_ITEM:
      return {
        items: state.items.filter(item => item.name !== action.itemName),
        total: state.total - action.item.price * action.item.quantity,
      }

    case INCREMENT:
      return {
        items: state.items.map(item =>
          item.name === action.item.name ? { ...item, quantity: item.quantity + 1 } : item,
        ),
        total: state.total + action.item.price,
      }

    case DECREMENT: {
      const target = state.items.find(item => item.name === action.item.name)
      if (!target) return state
      if (target.quantity === 1) {
        return {
          items: state.items.filter(item => item.name !== action.item.name),
          total: state.total - action.item.price,
        }
      }
      return {
        items: state.items.map(item =>
          item.name === action.item.name ? { ...item, quantity: item.quantity - 1 } : item,
        ),
        total: state.total - action.item.price,
      }
    }

    case CLEAR_CART:
      return initialCart

    default:
      return state
  }
}
