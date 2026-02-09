import { useReducer, useEffect, useCallback, useMemo } from 'react'
import { cartReducer, ADD_ITEM, REMOVE_ITEM, INCREMENT, DECREMENT, CLEAR_CART } from '@reducers/cartReducer'
import { getCartFromStorage, saveCartToStorage } from '@utils/cartStorage'
import { CartContext } from './cartContext'
import type { CartContextValue } from '@/types/context'
import type { Dessert } from '@/types/dessert'
import type { CartItem } from '@/types/cart'

interface CartProviderProps {
  children: React.ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () => getCartFromStorage())

  useEffect(() => {
    saveCartToStorage(cart)
  }, [cart])

  const addItem = useCallback((item: Dessert) => {
    dispatch({ type: ADD_ITEM, item })
  }, [])

  const removeItem = useCallback((item: CartItem) => {
    dispatch({ type: REMOVE_ITEM, itemName: item.name, item })
  }, [])

  const increment = useCallback((item: Dessert) => {
    dispatch({ type: INCREMENT, item })
  }, [])

  const decrement = useCallback((item: Dessert) => {
    dispatch({ type: DECREMENT, item })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: CLEAR_CART })
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addItem,
      removeItem,
      increment,
      decrement,
      clearCart,
    }),
    [cart, addItem, removeItem, increment, decrement, clearCart],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
