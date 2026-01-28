import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import { cartReducer, ADD_ITEM, REMOVE_ITEM, INCREMENT, DECREMENT, CLEAR_CART } from '@reducers/cartReducer'
import { getCartFromStorage, saveCartToStorage } from '@utils/cartStorage'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, () => getCartFromStorage())

  useEffect(() => {
    saveCartToStorage(cart)
  }, [cart])

  const addItem = useCallback(item => {
    dispatch({ type: ADD_ITEM, item })
  }, [])

  const removeItem = useCallback(item => {
    dispatch({ type: REMOVE_ITEM, itemName: item.name, item })
  }, [])

  const increment = useCallback(item => {
    dispatch({ type: INCREMENT, item })
  }, [])

  const decrement = useCallback(item => {
    dispatch({ type: DECREMENT, item })
  }, [])

  const clearCart = useCallback(() => {
    dispatch({ type: CLEAR_CART })
  }, [])

  const value = useMemo(
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
