import React from 'react'
import './styles.css'
import Navbar from './components/Navbar'
import { CartProvider } from './context/CartContext'

export const metadata = {
  description: 'A blank template using Payload in a Next.js app.',
  title: 'My Store',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <html lang="en">
      <body>
        <CartProvider> {/* 👈 wrap everything */}
          <Navbar />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
