import { loadFromStorage, saveToStorage } from '@hooks/useLocalStorage'
import { initialCart } from '@reducers/cartReducer'

const CART_KEY = 'dessert-shop-cart'

export function getCartFromStorage() {
  return loadFromStorage(CART_KEY, initialCart)
}

export function saveCartToStorage(cart) {
  return saveToStorage(CART_KEY, cart)
}
