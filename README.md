# Dessert Shop App

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [What's in the project](#whats-in-the-project)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Useful resources](#useful-resources)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- Add items to the cart and remove them
- Increase/decrease the number of items in the cart
- See an order confirmation modal when they click "Confirm Order"
- Reset their selections when they click "Start New Order"
- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page

### Screenshot

![Preview](./preview.jpg)

### What's in the project

- **Product catalog** — Grid of dessert cards (Waffle, Crème Brûlée, Macaron, Tiramisu, Cake, Panna Cotta, Baklava, Brownie, Meringue) with add-to-cart, increment, and decrement.
- **Cart sidebar** — Live list of items, quantities, remove, and order confirmation.
- **Order confirmation modal** — Summary after placing an order; closing it clears the cart.
- **Cart persistence** — Cart is saved to `localStorage` and restored on reload.
- **Responsive layout** — Mobile (375px), tablet, and desktop (1440px) with breakpoints from the [style guide](style-guide.md).
- **Styling** — Tailwind CSS, Red Hat Text, and a rose/red/green palette from the design.

**Project structure**

```
src/
├── context/
│   ├── cartContext.js      # CartContext (createContext only)
│   └── CartProvider.jsx    # CartProvider: useReducer, persistence, memoized value
├── hooks/
│   ├── useCart.js          # useCart(): context + isInCart, getItemQuantity
│   ├── useCartTotal.js     # useCartTotal(): itemCount, total (memoized)
│   └── useLocalStorage.js  # useLocalStorage, loadFromStorage, saveToStorage
├── reducers/
│   └── cartReducer.js      # cartReducer; ADD_ITEM, REMOVE_ITEM, INCREMENT, DECREMENT, CLEAR_CART
├── utils/
│   └── cartStorage.js      # getCartFromStorage, saveCartToStorage (uses useLocalStorage helpers)
├── components/
│   ├── Card.jsx            # Product card: add, increment, decrement via useCart
│   ├── Cart.jsx            # Cart list + total via useCart, useCartTotal
│   ├── CartItem.jsx        # Single cart line with remove
│   └── OrderConfirmed.jsx  # Confirmation modal; cart from useCart
├── data/
│   └── data.json           # Dessert catalog (name, price, image, category)
├── App.jsx
└── main.jsx                # CartProvider wraps App
```

Path aliases: `@context`, `@hooks`, `@components`, `@data`, `@reducers`, `@utils` (see `vite.config.js` and `jsconfig.json`).

**Run the app**

```bash
yarn install
yarn dev
```

- **Build:** `yarn build`
- **Preview:** `yarn preview`
- **Lint:** `yarn lint`
- **Format:** `yarn format`

### Links

- Solution URL: [Dessert Shop App Advanced](https://github.com/mmarlow/dessert-shop-app-advanced)
- Live Site URL: [Dessert Shop App Advanced](https://dessert-shop-app-advanced.vercel.app/)

## My process

### Built with

- React 19
- Vite 7 (HMR, Fast Refresh)
- Tailwind CSS 4 (with `@tailwindcss/vite`)
- lucide-react
- Semantic HTML5, Flexbox, CSS Grid, mobile-first workflow

### What I learned

1. **Fast Refresh and Context**
   - Fast Refresh only runs when a file exports **components only**. Exporting both `createContext()` and a `<CartProvider>` in one file breaks it.
   - **Fix:** Put the context in `cartContext.js` (only `createContext`) and the provider in `CartProvider.jsx` (only the component). Consumers import `CartContext` from `cartContext` and `CartProvider` from `CartProvider`.

2. **Context + useReducer instead of prop drilling**
   - Cart state and handlers were passed through several layers. Moving them into `CartContext` + `useCart` removed that. Components that need the cart use `useCart()` (or `useCartTotal()`) instead of props.

3. **Stable context value and actions**
   - A new `value={{ cart, addItem, ... }}` every render forces all context consumers to re-render. Use `useMemo` for the value and `useCallback` for each action so references stay stable when dependencies don't change.

4. **Reducer in its own file**
   - `cartReducer` is a pure `(state, action) => newState` with no React or I/O. Keeping it in `reducers/cartReducer.js` makes it easy to test and keeps the provider focused on wiring React, persistence, and context.

5. **Lazy init for useReducer + localStorage**
   - Use the 3-arg form: `useReducer(cartReducer, undefined, () => getCartFromStorage())` so the initial state is read from `localStorage` once at mount, not on every render.

6. **localStorage and errors**
   - `loadFromStorage` / `saveToStorage` use try/catch for `JSON.parse` and `localStorage.setItem`. That handles corrupt data, `QuotaExceededError`, and private browsing. `cartStorage.js` wraps these for the cart key and `initialCart`.

7. **Custom hooks: one job each**
   - `useCart`: read context and add helpers (`isInCart`, `getItemQuantity`). Throws if used outside `CartProvider`.
   - `useCartTotal`: derived `itemCount` and `total` with `useMemo`, built on top of `useCart`. Keeps components simple and avoids duplicate logic.

8. **Path aliases**
   - `@context`, `@hooks`, `@reducers`, etc. make imports shorter and less tied to folder moves. They need to be set in both `vite.config.js` and `jsconfig.json` for the tooling and editor to agree.
