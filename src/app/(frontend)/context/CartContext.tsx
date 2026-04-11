'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: any) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) setItems(JSON.parse(stored))
  }, [])

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: any) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        // increase quantity if already in cart
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image?.url,
        quantity: 1,
      }]
    })
  }

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(id)
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => setItems([])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
