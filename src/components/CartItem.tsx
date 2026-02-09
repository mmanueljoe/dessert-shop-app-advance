import { CircleX } from 'lucide-react'
import { useCart } from '@hooks/useCart'
import type { CartItem as CartItemType } from '@/types/cart'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem } = useCart()
  return (
    <div className="flex flex-row items-center justify-between border-b border-rose-100 p-200">
      <div className="flex flex-col gap-100">
        <h3 className="text-preset4 font-bold">{item.name}</h3>
        <div className="flex flex-row items-center justify-between">
          <span className="text-preset4 text-red font-bold">{item.quantity}x</span>
          <span className="text-preset4 text-rose-500">{`@ $${item.price.toFixed(2)}`}</span>
          <span className="text-preset4 text-rose-500 font-bold">{`$${(item.price * item.quantity).toFixed(2)}`}</span>
        </div>
      </div>
      <button type="button" onClick={() => removeItem(item)}>
        <CircleX className="w-5 h-5 text-rose-500" />
      </button>
    </div>
  )
}
