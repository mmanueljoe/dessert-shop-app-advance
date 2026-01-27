const CART_KEY = 'dessert-shop-cart'

export function saveCartToStorage(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

export function getCartFromStorage() {
  const storedCart = localStorage.getItem(CART_KEY)

  if (storedCart) {
    return JSON.parse(storedCart)
  }
  return { items: [], total: 0 }
}
