import { loadFromStorage, saveToStorage } from '@hooks/useLocalStorage'
import type { CartState } from '@/types/cart'
import { initialCart } from '@reducers/cartReducer'

const CART_KEY = 'dessert-shop-cart'

export function getCartFromStorage(): CartState {
  return loadFromStorage(CART_KEY, initialCart)
}

export function saveCartToStorage(cart: CartState): { success: boolean; error: Error | null } {
  return saveToStorage(CART_KEY, cart)
}
