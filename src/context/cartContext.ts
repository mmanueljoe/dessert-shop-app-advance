import { createContext } from 'react'
import type { CartContextValue } from '@/types/context'

export const CartContext = createContext<CartContextValue | null>(null)
