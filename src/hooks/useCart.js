import { useContext } from 'react'
import { CartContext } from '@context/CartContext'

export function useCart() {
  const ctx = useContext(CartContext)

  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }

  const isInCart = name => ctx.cart.items.some(item => item.name === name)

  const getItemQuantity = name => {
    const item = ctx.cart.items.find(item => item.name === name)
    return item ? item.quantity : 0
  }

  return {
    ...ctx,
    isInCart,
    getItemQuantity,
  }
}
