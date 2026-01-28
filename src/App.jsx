import { useReducer, useEffect, useState } from 'react'
import './App.css'
import { Card } from '@components/Card'
import { Cart } from '@components/Cart'
import data from '@data/data.json'
import { cartReducer } from '@reducers/cartReducer'
import { saveCartToStorage, getCartFromStorage } from '@utils/cartStorage'
import { OrderConfirmed } from '@components/OrderConfirmed'
function App() {
  const [cart, dispatch] = useReducer(cartReducer, getCartFromStorage())
  useEffect(() => {
    saveCartToStorage(cart)
  }, [cart])
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false)

  function addToCart(item) {
    dispatch({ type: 'ADD_ITEM', item })
  }

  function removeFromCart(item) {
    dispatch({ type: 'REMOVE_ITEM', itemName: item.name, item })
  }

  function increment(item) {
    dispatch({ type: 'INCREMENT', item })
  }

  function decrement(item) {
    dispatch({ type: 'DECREMENT', item })
  }

  function orderConfirmation() {
    setIsOrderConfirmed(true)
  }

  function closeOrderModal() {
    dispatch({ type: 'CLEAR_CART' })
    setIsOrderConfirmed(false)
  }

  return (
    <div className="grid grid-cols-1 bg-rose-50 p-300 md:p-500 md:gap-500 lg:grid-cols-2 lg:gap-400 relative">
      <div className="grid grid-cols-1 gap-400">
        <h2 className="text-preset1 mb-400 font-bold col-span-full">Desserts</h2>
        <div className="grid grid-cols-1 gap-400 md:grid-cols-2 lg:grid-cols-3 lg:gap-200">
          {data.map(item => (
            <Card
              key={item.name}
              {...item}
              addToCart={addToCart}
              removeFromCart={removeFromCart}
              increment={increment}
              decrement={decrement}
              cart={cart.items}
            />
          ))}
        </div>
      </div>
      <div>
        <Cart cart={cart} removeFromCart={removeFromCart} orderConfirmation={orderConfirmation} />
      </div>
      <OrderConfirmed
        isOrderConfirmed={isOrderConfirmed}
        closeOrderModal={closeOrderModal}
        cart={cart}
        onClose={closeOrderModal}
      />
    </div>
  )
}

export default App
