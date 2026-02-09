import { useEffect } from 'react'
import { CircleCheck } from 'lucide-react'
import { useCart } from '@hooks/useCart'
import { useCartTotal } from '@hooks/useCartTotal'

interface OrderConfirmedProps {
  isOrderConfirmed: boolean
  onClose: () => void
  closeOrderModal: () => void
}

export function OrderConfirmed({ isOrderConfirmed, onClose }: OrderConfirmedProps) {
  const { cart } = useCart()
  const { total } = useCartTotal()
  useEffect(() => {
    if (isOrderConfirmed) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOrderConfirmed])

  return isOrderConfirmed ? (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        onKeyDown={e => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />
      <div className="absolute bottom-0 left-0 right-0 z-10 flex max-h-[85vh] flex-col gap-400 overflow-y-auto rounded-t-md bg-white p-300 md:bottom-auto md:left-1/2 md:right-auto md:top-1/2 md:max-h-[90vh] md:w-full md:max-w-[500px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-md">
        <div className="flex flex-col gap-400 bg-white w-full">
          <div>
            <CircleCheck className="w-10 h-10 text-green mb-300" />
            <h2 className="text-preset1 font-bold text-black mb-200">Order Confirmed</h2>
            <p className="text-preset3 font-regular text-rose-500">We hope your enjoy your food!</p>
          </div>
          <div className="bg-rose-50 p-300 rounded-md flex flex-col gap-300">
            <div className="flex flex-col py-300 ">
              {cart.items.map(item => (
                <div
                  key={item.name}
                  className="flex flex-row items-center justify-between border-b border-rose-100 py-200"
                >
                  <div className="flex flex-row gap-200 rounded-md">
                    <img
                      src={item.image?.mobile || item.image?.thumbnail}
                      alt={item.name}
                      className="w-[60px] h-[60px] object-cover rounded-md"
                    />
                    <div className="flex flex-col gap-200">
                      <h3 className="text-preset4 font-bold text-black">{item.name}</h3>
                      <div className="flex flex-row gap-100">
                        <p className="text-preset4 font-bold text-red">{item.quantity}x</p>
                        <p className="text-preset4 font-regular text-rose-500">{`@ $${item.price.toFixed(2)}`}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-preset3 font-bold text-rose-900">{`$${(item.price * item.quantity).toFixed(2)}`}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-row items-center justify-between">
              <p className="text-preset4 font-regular text-rose-900">Order Total</p>
              <p className="text-preset2 font-bold text-rose-900">{`$${total.toFixed(2)}`}</p>
            </div>
          </div>
        </div>
        <button type="button" className="confirm-order-button" onClick={onClose}>
          Start New Order
        </button>
      </div>
    </div>
  ) : null
}
