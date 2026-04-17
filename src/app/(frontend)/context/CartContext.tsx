'use client'

import { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  id: string
  cartKey: string
  name: string
  price: number
  image?: any
  quantity: number
  variant?: string
}

interface CartContextType {
  items: CartItem[]
  addToCart: (product: any, variant?: { name: string; price?: number }) => void
  removeFromCart: (cartKey: string) => void
  updateQuantity: (cartKey: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('cart')
    if (stored) setItems(JSON.parse(stored))
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product: any, variant?: { name: string; price?: number }) => {
    const price = variant?.price ?? product.price
    const cartKey = variant ? `${product.id}__${variant.name}` : product.id

    setItems(prev => {
      const existing = prev.find(item => item.cartKey === cartKey)
      if (existing) {
        return prev.map(item =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, {
        id: product.id,
        cartKey,
        name: product.name,
        price,
        image: product.image,
        quantity: 1,
        variant: variant?.name,
      }]
    })
  }

  const removeFromCart = (cartKey: string) => setItems(prev => prev.filter(i => i.cartKey !== cartKey))

  const updateQuantity = (cartKey: string, quantity: number) => {
    if (quantity < 1) return removeFromCart(cartKey)
    setItems(prev => prev.map(item => item.cartKey === cartKey ? { ...item, quantity } : item))
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
