import { CircleMinus, ShoppingCart } from 'lucide-react'
import { CirclePlus } from 'lucide-react'
export function Card({ name, price, image, category, addToCart, cart, increment, decrement }) {
  const item = { name, price, image, category }
  const imageUrl = image?.mobile || image?.thumbnail
  const cartItem = cart.find(item => item.name === name)

  function handleAddToCart() {
    addToCart(item)
  }
  function handleIncrement() {
    increment(item)
  }
  function handleDecrement() {
    decrement(item)
  }

  return (
    <div className="flex flex-col gap-400 max">
      <div className="relative rounded-md">
        <img src={imageUrl} alt={name} className="rounded-md" />
        <div className="absolute left-0 right-0 flex justify-center -bottom-6 z-10">
          {cartItem ? (
            <div className="quantity-button-container">
              <button type="button" onClick={handleDecrement}>
                <CircleMinus className="w-4 h-4" />
              </button>
              <span>{cartItem.quantity}</span>
              <button type="button" onClick={handleIncrement}>
                <CirclePlus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={handleAddToCart} className="add-to-cart-button">
              <ShoppingCart className="w-4 h-4 text-red" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-100">
        <span className="text-preset4 text-rose-500">{category}</span>
        <h3 className="text-preset3 font-semibold">{name}</h3>
        <p className="text-preset3 font-semibold text-red">{`$${price.toFixed(2)}`}</p>
      </div>
    </div>
  )
}
