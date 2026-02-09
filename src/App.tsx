import { data } from '@data/data'
import { useState } from 'react'
import { useCart } from '@hooks/useCart'
import { Card } from '@components/Card'
import { Cart } from '@components/Cart'
import { OrderConfirmed } from '@components/OrderConfirmed'

function App() {
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false)
  const { clearCart } = useCart()

  function orderConfirmation() {
    setIsOrderConfirmed(true)
  }

  function closeOrderModal() {
    clearCart()
    setIsOrderConfirmed(false)
  }

  return (
    <div className="grid grid-cols-1 bg-rose-50 p-300 md:p-500 md:gap-500 lg:grid-cols-2 lg:gap-400 relative">
      <div className="grid grid-cols-1 gap-400">
        <h2 className="text-preset1 mb-400 font-bold col-span-full">Desserts</h2>
        <div className="grid grid-cols-1 gap-400 md:grid-cols-2 lg:grid-cols-3 lg:gap-200">
          {data.map(item => (
            <Card key={item.name} {...item} />
          ))}
        </div>
      </div>
      <div>
        <Cart orderConfirmation={orderConfirmation} />
      </div>
      <OrderConfirmed isOrderConfirmed={isOrderConfirmed} closeOrderModal={closeOrderModal} onClose={closeOrderModal} />
    </div>
  )
}

export default App
