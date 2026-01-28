import { useMemo } from 'react'
import { useCart } from '@hooks/useCart'

export function useCartTotal() {
  const { cart } = useCart()

  return useMemo(
    () => ({
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      total: cart.total,
    }),
    [cart.items, cart.total],
  )
}
