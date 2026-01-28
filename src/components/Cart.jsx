import { CartItem } from '@components/CartItem'
import { Sprout } from 'lucide-react'
import Illustration from '@assets/illustration.png'
import { useCart } from '@hooks/useCart'
import { useCartTotal } from '@hooks/useCartTotal'

export function Cart({ orderConfirmation }) {
  const { cart, removeItem } = useCart()
  const { itemCount, total } = useCartTotal()
  return (
    <>
      {itemCount > 0 ? (
        <div className="flex flex-col gap-400 bg-white p-300 rounded-md lg:max-w-[500px] w-full">
          <h2 className="text-preset2 font-bold text-red">Your Cart ({itemCount})</h2>
          <ul>
            {cart.items.map(item => (
              <CartItem key={item.name} item={item} removeItem={removeItem} />
            ))}
          </ul>
          <div className="flex flex-row items-center justify-between">
            <span className="text-preset4 text-black font-regular">Order Total</span>
            <span className="text-preset2 text-black font-bold">{`$${total.toFixed(2)}`}</span>
          </div>
          <div className="flex flex-row items-center justify-center gap-100 bg-rose-50 p-200 rounded-md">
            <Sprout className="w-4 h-4 text-green" />
            <p className="text-preset4 text-rose-900 font-regular">
              This is a <span className="text-rose-900 font-bold">carbon-neutral</span> delivery
            </p>
          </div>
          <button type="button" className="confirm-order-button" onClick={orderConfirmation}>
            Confirm Order
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-300 bg-white p-300 w-full rounded-md lg:max-w-[500px]">
          <h2 className="text-preset2 font-bold text-red">Your Cart ({itemCount})</h2>
          <div className="flex flex-col py-200 gap-200 bg-white rounded-md items-center justify-center">
            <img src={Illustration} alt="Illustration" />
            <p className="text-preset3 font-semibold text-rose-500">Your added items will appear here</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Cart
