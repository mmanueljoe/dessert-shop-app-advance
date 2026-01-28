# Dessert Shop: Advanced React Patterns — Implementation Document

This document describes how to add **Context API**, **useReducer in Context**, **localStorage persistence**, **performance optimizations**, and **custom hooks** to your existing dessert shop app. It does **not** modify your code; use it as a step‑by‑step guide to implement the changes yourself.

---

## Part 1: Project Analysis

### Current File Structure

```
src/
├── App.jsx              # Root: useReducer, useEffect persistence, modal state, prop drilling
├── main.jsx             # Entry: renders <App /> only
├── components/
│   ├── Card.jsx         # Product card: add/increment/decrement, receives cart + 4 handlers
│   ├── Cart.jsx         # Cart list + total: cart, removeFromCart, orderConfirmation
│   ├── CartItem.jsx     # Single line item: item, removeFromCart
│   └── OrderConfirmed.jsx # Modal: isOrderConfirmed, cart, onClose
├── data/
│   └── data.json        # Dessert catalog
├── reducers/
│   └── cartReducer.js   # itemReducer, initialCart; actions: ADD_ITEM, REMOVE_ITEM, INCREMENT, DECREMENT, CLEAR_CART
└── utils/
    └── cartStorage.js   # getCartFromStorage, saveCartToStorage; key: 'dessert-shop-cart'
```

### Where Cart State Lives

- **State:** `App.jsx` — `useReducer(itemReducer, getCartFromStorage())`
- **Persistence:** `useEffect` in `App` runs `saveCartToStorage(cart)` when `cart` changes
- **Modal state:** `App` — `useState(false)` for `isOrderConfirmed`; `closeOrderModal` dispatches `CLEAR_CART` and resets modal

### Reducer Summary

`cartReducer.js` exports:

- `initialCart = { items: [], total: 0 }`
- `itemReducer(state, action)` with:
  - `ADD_ITEM` — add new or increment existing by `item.name`
  - `REMOVE_ITEM` — needs `action.itemName`, `action.item` (for `price * quantity`)
  - `INCREMENT` / `DECREMENT` — `action.item`; DECREMENT to 0 removes the line
  - `CLEAR_CART` — reset to `initialCart`

Action types are string literals; there is no `loadFromStorage`/`saveToStorage` error handling.

### Component Hierarchy and Props

```
App
├── Card (×N)     ← addToCart, removeFromCart, increment, decrement, cart (= cart.items)
├── Cart          ← cart, removeFromCart, orderConfirmation
│   └── CartItem  ← item, removeFromCart
└── OrderConfirmed ← isOrderConfirmed, closeOrderModal, cart, onClose
```

**Prop drilling:** `addToCart`, `removeFromCart`, `increment`, `decrement`, and `cart` originate in `App` and are passed down. `Card` and `Cart`/`CartItem` only need these to read/update the cart; they don’t need to be in `App`’s tree for that.

### Gaps vs. Target Design

| Area         | Current                                                            | Target                                                                                                               |
| ------------ | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| State access | Props from App                                                     | Context + `useCart`                                                                                                  |
| Reducer      | In App, string action types                                        | In Context; constants; reducer in its own file                                                                       |
| Persistence  | `getCartFromStorage`/`saveCartToStorage` in App; no error handling | `useLocalStorage`-backed flow + `loadFromStorage`/`saveToStorage` with try/catch and quota/private‑browsing handling |
| Performance  | New function refs each render; no memoization                      | `useCallback` for actions, `useMemo` for totals/counts, `React.memo` on leaves                                       |
| Reuse        | Logic in App                                                       | `useCart`, `useCartTotal`, `useLocalStorage`                                                                         |

---

## Part 2: Implementation Files (Reference Code)

Below is **reference code** for new and updated files. Add or adjust these in your project; the doc does not edit your repo.

---

### 2.1 Action Type Constants and Reducer — `src/reducers/cartReducer.js`

**Goal:** Use named constants for action types and keep the reducer as a pure function. Renaming `itemReducer` → `cartReducer` is optional but consistent with “cart” naming.

Add at the top (and use in the `switch`):

```javascript
// Action type constants
export const ADD_ITEM = 'ADD_ITEM'
export const REMOVE_ITEM = 'REMOVE_ITEM'
export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT'
export const CLEAR_CART = 'CLEAR_CART'

export const initialCart = { items: [], total: 0 }

export function cartReducer(state, action) {
  switch (action.type) {
    case ADD_ITEM: // ... same logic, use ADD_ITEM instead of 'ADD_ITEM'
    case REMOVE_ITEM: // ...
    case INCREMENT: // ...
    case DECREMENT: // ...
    case CLEAR_CART: // ...
    default:
      return state
  }
}
```

Keep `itemReducer` as `export const itemReducer = cartReducer` if you prefer to avoid renaming `App` in the first step.

---

### 2.2 `useLocalStorage` and Helpers — `src/hooks/useLocalStorage.js` (new)

**Goal:** Reusable persistence with `load`/`save` helpers and basic error handling (corrupt JSON, `QuotaExceededError`, private browsing).

Create `src/hooks/useLocalStorage.js`:

```javascript
import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => loadFromStorage(key, initialValue))
  const [error, setError] = useState(null)

  useEffect(() => {
    const { success, err } = saveToStorage(key, value)
    setError(success ? null : err)
  }, [key, value])

  const setStoredValue = useCallback(newValueOrUpdater => {
    setValue(prev => (typeof newValueOrUpdater === 'function' ? newValueOrUpdater(prev) : newValueOrUpdater))
  }, [])

  return [value, setStoredValue, { error }]
}

export function loadFromStorage(key, initialValue) {
  try {
    const raw = localStorage.getItem(key)
    if (raw == null) return initialValue
    return JSON.parse(raw)
  } catch (e) {
    if (typeof console?.warn === 'function') {
      console.warn(`[useLocalStorage] load("${key}"):`, e?.message ?? e)
    }
    return initialValue
  }
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return { success: true, err: null }
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e))
    if (typeof console?.warn === 'function') {
      console.warn(`[useLocalStorage] save("${key}"):`, err.message)
    }
    return { success: false, err }
  }
}
```

---

### 2.3 Cart-Specific Storage — `src/utils/cartStorage.js`

**Goal:** Keep the cart key and default shape in one place; wire to `loadFromStorage`/`saveToStorage` (and optionally surface `save` errors).

```javascript
import { loadFromStorage, saveToStorage } from '@hooks/useLocalStorage'
import { initialCart } from '@reducers/cartReducer'

const CART_KEY = 'dessert-shop-cart'

export function getCartFromStorage() {
  return loadFromStorage(CART_KEY, initialCart)
}

export function saveCartToStorage(cart) {
  return saveToStorage(CART_KEY, cart)
}
```

You’ll need a path alias `@hooks` (e.g. in `vite.config.js` and `jsconfig.json`) pointing to `src/hooks`.

---

### 2.4 `CartContext` — `src/context/CartContext.jsx` (new)

**Goal:** Own `useReducer`, hydrate from `getCartFromStorage`, persist with `saveCartToStorage`, and expose memoized actions and values.

```jsx
import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import {
  cartReducer,
  initialCart,
  ADD_ITEM,
  REMOVE_ITEM,
  INCREMENT,
  DECREMENT,
  CLEAR_CART,
} from '@reducers/cartReducer'
import { getCartFromStorage, saveCartToStorage } from '@utils/cartStorage'

export const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(
    cartReducer,
    undefined,
    () => getCartFromStorage(), // lazy init from localStorage
  )

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
```

Add a path alias `@context` for `src/context` if you use `@context/CartContext`.

---

### 2.5 `useCart` — `src/hooks/useCart.js` (new)

**Goal:** Single place to read Context, with error handling and helpers `isInCart` and `getItemQuantity`.

```javascript
import { useContext } from 'react'
import { CartContext } from '@context/CartContext'

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider')
  }

  const isInCart = name => ctx.cart.items.some(i => i.name === name)

  const getItemQuantity = name => {
    const item = ctx.cart.items.find(i => i.name === name)
    return item ? item.quantity : 0
  }

  return {
    ...ctx,
    isInCart,
    getItemQuantity,
  }
}
```

---

### 2.6 `useCartTotal` — `src/hooks/useCartTotal.js` (new)

**Goal:** Memoized derived values for item count and total to avoid recalculating in multiple components.

```javascript
import { useMemo } from 'react'
import { useCart } from '@hooks/useCart'

export function useCartTotal() {
  const { cart } = useCart()

  return useMemo(
    () => ({
      itemCount: cart.items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      total: cart.total,
    }),
    [cart.items, cart.total],
  )
}
```

`cart.total` is already in state; this hook mainly centralizes `itemCount` and can be extended (e.g. `formattedTotal`).

---

## Part 3: Refactoring Guide

### 3.1 `main.jsx` — Wrap App with `CartProvider`

**Before:**

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**After:**

```jsx
import { CartProvider } from '@context/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
)
```

---

### 3.2 `App.jsx` — Remove Cart State and Prop Drilling

**Before:** `useReducer`, `useEffect` for persistence, `addToCart`/`removeFromCart`/`increment`/`decrement`, and passing `cart`, `removeFromCart`, `orderConfirmation` into `Card` and `Cart`; `closeOrderModal` dispatches `CLEAR_CART`.

**After:** Keep only `isOrderConfirmed` and `orderConfirmation`; get `clearCart` from `useCart` and call it inside `closeOrderModal`. No cart state, no cart/action props to `Card` or `Cart`.

Example:

```jsx
import { useState } from 'react'
import { useCart } from '@hooks/useCart'
// ... other imports

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
    <div className="...">
      <div className="...">
        <h2>Desserts</h2>
        <div className="...">
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
```

`OrderConfirmed` will get `cart` from `useCart` inside the component (see below) instead of from `App`.

---

### 3.3 `Card.jsx` — Use `useCart` Instead of Props

**Before:** Props `addToCart`, `cart`, `increment`, `decrement`. Uses `cart.find(...)` and `cartItem.quantity`.

**After:** No cart-related props. Use `useCart` for `addItem`, `increment`, `decrement`, and either `isInCart`/`getItemQuantity` or `cart.items`.

Example:

```jsx
import { useCart } from '@hooks/useCart'

export function Card({ name, price, image, category }) {
  const item = { name, price, image, category }
  const { addItem, increment, decrement, isInCart, getItemQuantity } = useCart()
  const inCart = isInCart(name)
  const quantity = getItemQuantity(name)
  // ...
  // onClick: addItem(item) | increment(item) | decrement(item)
}
```

You can optionally wrap `Card` in `React.memo` if the parent re-renders often and `Card` props are stable.

---

### 3.4 `Cart.jsx` — Use `useCart` and `useCartTotal`

**Before:** Props `cart`, `removeFromCart`, `orderConfirmation`. Derives `totalQuantity` from `cart.items`.

**After:** Only `orderConfirmation` from props. `useCart` for `cart`, `removeItem`; `useCartTotal` for `itemCount` (and optionally `total` if you want to centralize it).

Example:

```jsx
import { useCart } from '@hooks/useCart'
import { useCartTotal } from '@hooks/useCartTotal'

export function Cart({ orderConfirmation }) {
  const { cart, removeItem } = useCart()
  const { itemCount } = useCartTotal()
  // Use cart.items, cart.total, removeItem, itemCount
}
```

`CartItem` receives `removeItem` (or `onRemove`) and `item`; no `cart` prop.

---

### 3.5 `CartItem.jsx` — `removeFromCart` → `onRemove` or `removeItem`

**Before:** `removeFromCart(item)`.

**After:** Same behavior; prop can be renamed to `onRemove` or stay as `removeItem` from context. Parent (`Cart`) gets `removeItem` from `useCart` and passes it down. If you memoize `CartItem`, pass stable callbacks (e.g. `() => removeItem(item)` or a memoized handler).

---

### 3.6 `OrderConfirmed.jsx` — Get `cart` from `useCart`

**Before:** Props `isOrderConfirmed`, `cart`, `onClose`.

**After:** Props `isOrderConfirmed`, `onClose`; `cart` from `useCart()` inside the component.

```jsx
const { cart } = useCart()
```

---

## Part 4: Implementation Document (Architecture, Steps, Patterns, Future)

### Section A: Architecture Overview

#### Proposed File Structure

```
src/
├── context/
│   └── CartContext.jsx   # CartProvider, CartContext
├── hooks/
│   ├── useLocalStorage.js
│   ├── useCart.js
│   └── useCartTotal.js
├── reducers/
│   └── cartReducer.js    # + constants; cartReducer
├── utils/
│   └── cartStorage.js    # uses loadFromStorage/saveToStorage
├── components/
│   ├── Card.jsx
│   ├── Cart.jsx
│   ├── CartItem.jsx
│   └── OrderConfirmed.jsx
├── App.jsx
└── main.jsx
```

#### Data Flow

```
CartProvider (useReducer + getCartFromStorage / saveCartToStorage)
    ↓
CartContext.Provider value = { cart, addItem, removeItem, increment, decrement, clearCart }
    ↓
useCart() / useCartTotal()
    ↓
Card, Cart, CartItem, OrderConfirmed, App (only for clearCart + modal)
```

- **Context** holds the cart state and action creators.
- **Hooks** read Context and add helpers or derived data.
- **Components** use hooks instead of props for cart.

#### Separation of Concerns

| Layer                      | Responsibility                                                                |
| -------------------------- | ----------------------------------------------------------------------------- |
| `cartReducer.js`           | Pure `(state, action) → state`; no React, no I/O                              |
| `cartStorage.js`           | Cart key, `getCartFromStorage` / `saveCartToStorage`                          |
| `useLocalStorage.js`       | Generic localStorage + `loadFromStorage` / `saveToStorage` and error handling |
| `CartContext`              | useReducer, hydration, persistence, and memoized context value                |
| `useCart` / `useCartTotal` | Consuming context, helpers, derived values                                    |
| Components                 | UI only; no direct `dispatch` or reducer logic                                |

---

### Section B: Step-by-Step Implementation

1. **Reducer and constants**
   - In `cartReducer.js`, add `ADD_ITEM`, `REMOVE_ITEM`, `INCREMENT`, `DECREMENT`, `CLEAR_CART` and use them in the `switch`.
   - Optional: rename `itemReducer` → `cartReducer` and update imports.

2. **Hooks and path aliases**
   - Add `@hooks` and `@context` in `vite.config.js` and `jsconfig.json`.
   - Create `src/hooks/useLocalStorage.js` with `useLocalStorage`, `loadFromStorage`, `saveToStorage`.

3. **Cart storage**
   - Update `cartStorage.js` to use `loadFromStorage`/`saveToStorage` and `initialCart` as above.

4. **CartContext**
   - Create `CartContext.jsx` with `CartProvider`: `useReducer` (init with `getCartFromStorage`), `useEffect` → `saveCartToStorage`, `useCallback` for `addItem`/`removeItem`/`increment`/`decrement`/`clearCart`, `useMemo` for `value`.
   - Wrap `App` in `CartProvider` in `main.jsx`.

5. **useCart and useCartTotal**
   - Implement `useCart` (Context + `isInCart`, `getItemQuantity`) and `useCartTotal` (`itemCount`, `total`).

6. **Refactor components**
   - `App`: remove cart state/effects, use `useCart().clearCart` in `closeOrderModal`; drop cart/action props to `Card`/`Cart`; `OrderConfirmed` no longer needs `cart` from `App`.
   - `Card`: `useCart` for add/increment/decrement and `isInCart`/`getItemQuantity`.
   - `Cart`: `useCart`, `useCartTotal`; pass `removeItem` to `CartItem`.
   - `CartItem`: keep `item` and `removeFromCart`/`onRemove` from parent.
   - `OrderConfirmed`: `useCart()` for `cart`.

7. **Performance**
   - Wrap `Card`, `CartItem` in `React.memo` if their parents re-render often and props are stable.
   - Ensure `CartContext` value is `useMemo`’d and actions are `useCallback`’d so children don’t re-render unnecessarily when only other parts of the tree change.

**Checkpoints:** After step 4, cart should work as before but from Context. After step 6, no cart-related prop drilling. After step 7, fewer redundant re-renders (verify with React DevTools).

---

### Section C: Thought Process and Patterns

#### Context API vs Prop Drilling

- **Use Context when:**
  - Many components need the same data (e.g. theme, user, cart).
  - Prop drilling goes through 2+ layers that don’t use the data.
- **Keep props when:**
  - Parent truly “owns” the data and one or two children use it.
  - You want explicit data flow and easy unit tests with plain props.

Context does **not** replace Redux or server cache; it’s for “global” UI state that changes at human speed.

#### Reducer in a Separate File

- Reducer = `(state, action) => newState` with **no** side effects.
- Putting it in its own file makes it testable without React and keeps `CartContext` focused on “wire React to reducer + persistence.”

#### useMemo vs useCallback vs React.memo

- **useMemo:** Expensive _values_ (e.g. `itemCount`, filtered lists). Recomputed only when deps change.
- **useCallback:** Stable _function_ identity for `props` or `context` (e.g. `addItem`, `removeItem`) so memoized children don’t re-render when the parent re-renders.
- **React.memo:** Skip re-render when props are shallow-equal. Use on leaves (e.g. `Card`, `CartItem`) that get stable props from a frequently re-rendering parent.

Rule of thumb: use `useMemo`/`useCallback` at the _source_ (Context, parent); use `React.memo` at the _sink_ (leaf components).

#### Custom Hooks

- One main job per hook: `useCart` = “cart from context + cart helpers”; `useCartTotal` = “derived totals.”
- Compose: `useCartTotal` uses `useCart`.
- Keep them pure of UI: no JSX, no direct DOM; return data and callbacks.

---

### Section D: Future Application

#### When I See X, Apply Y

| X                                                         | Y                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| Same data passed through several levels                   | Context + custom hook (e.g. `useCart`)                       |
| Complex state with many actions                           | `useReducer` in Context; reducer in its own file             |
| State must survive refresh                                | `useLocalStorage` or `load`/`save` + `useEffect` in provider |
| New function/object every render passed to memoized child | `useCallback` / `useMemo` at the provider or parent          |
| Leaf re-renders on parent update but props unchanged      | `React.memo` on the leaf                                     |
| Reusable non-UI logic                                     | Custom hook (e.g. `useLocalStorage`, `useCartTotal`)         |

#### Reusable Templates

**New Context (state + actions):**

```jsx
const Ctx = createContext(null)
export function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, init)
  const actions = useMemo(() => ({ ... }), [dispatch])
  const value = useMemo(() => ({ state, ...actions }), [state, actions])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useMy() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useMy must be used within Provider')
  return c
}
```

**Generic `useLocalStorage`:**  
`const [v, setV, { error }] = useLocalStorage('key', default)`  
For `useReducer` + persistence: use `loadFromStorage` in the reducer initializer and `saveToStorage` in `useEffect` in the provider.

**Optimizing a list item:**  
`export const Item = React.memo(function Item({ id, onAction }) { ... })`  
and pass `onAction` as a `useCallback` from the parent.

#### When to Split Contexts or Use a Library

- **Split Context:** When one part of the value changes often (e.g. “cart items”) and another rarely (e.g. “actions”). Splitting reduces re-renders for consumers that only need the stable part.
- **State library (Zustand, Redux, etc.):** When you have many domains, cross-cutting concerns, or need middlewares (logging, persistence, devtools). For a single cart, Context + `useReducer` is enough.

#### Common Pitfalls

1. **`useReducer` init:** Use the 3-arg form: `useReducer(reducer, undefined, () => getCartFromStorage())` so `getCartFromStorage` runs once, not on every render.
2. **Context value:** Create a new object every render, e.g. `value={{ cart, addItem }}`, without `useMemo` → every consumer re-renders. Always `useMemo` the value.
3. **Callbacks in context:** Define with `useCallback`; otherwise they break memoization of children.
4. **`useCart` outside provider:** Throw a clear error so you don’t get `undefined` behavior.
5. **localStorage:** Handle `QuotaExceededError` and private browsing; avoid `JSON.parse` on unsanitized input without try/catch.

---

## Part 5: Quick Reference

### Context + useReducer + persistence

```
Provider: useReducer(init from load) → useEffect(save on state change) → useCallback(actions) → useMemo(value)
Consumers: useContext in a custom hook that throws if null
```

### useMemo / useCallback / React.memo

- **useMemo:** `const x = useMemo(() => heavy(a, b), [a, b])`
- **useCallback:** `const f = useCallback(() => do(a), [a])`
- **React.memo:** `export const C = React.memo(function C(props) { ... })`

### Custom hook checklist

- [ ] Single responsibility
- [ ] No JSX
- [ ] Can depend on other hooks
- [ ] Returns data and/or callbacks
- [ ] Documents when to use it

### localStorage

- **Read:** `loadFromStorage(key, fallback)` in initializer or first render; always in try/catch.
- **Write:** `saveToStorage(key, value)` in `useEffect`; handle `QuotaExceededError` and private mode.

### Debugging

- **Context:** React DevTools → select a component → see `Context` in the right-hand panel.
- **Re-renders:** DevTools Profiler; `React.memo` and stable context value should reduce them.
- **Persistence:** Add items, refresh; inspect `localStorage` in Application tab; test in private window to see fallbacks.

---

## Path Aliases to Add

In `vite.config.js` `resolve.alias`:

```js
'@hooks': path.resolve(__dirname, 'src/hooks'),
'@context': path.resolve(__dirname, 'src/context'),
```

In `jsconfig.json` `compilerOptions.paths`:

```json
"@hooks/*": ["src/hooks/*"],
"@context/*": ["src/context/*"]
```

---

_This document is a guide only; it does not modify your project. Implement the steps in order and run the app and tests after each change to validate behavior._
