import React from 'react'
import './styles.css'
import Navbar from './components/Navbar'
import { CartProvider } from './context/CartContext'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
  title: {
    default: 'My Store',
    template: '%s | My Store',
  },
  description: 'Shop the latest products at great prices.',
  openGraph: {
    siteName: 'My Store',
    type: 'website',
  },
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
