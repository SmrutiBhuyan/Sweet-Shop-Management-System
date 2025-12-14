import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from localStorage on initial render
    const savedCart = localStorage.getItem('sweetShopCart')
    return savedCart ? JSON.parse(savedCart) : []
  })

  const [isCartOpen, setIsCartOpen] = useState(false)

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sweetShopCart', JSON.stringify(cartItems))
  }, [cartItems])

  // Add item to cart
  const addToCart = (sweet, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === sweet.id)
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item.id === sweet.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Add new item to cart
        return [...prevItems, {
          id: sweet.id,
          name: sweet.name,
          price: sweet.price,
          imageUrl: sweet.imageUrl,
          quantity,
          stock: sweet.quantityInStock
        }]
      }
    })
  }

  // Remove item from cart
  const removeFromCart = (sweetId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== sweetId))
  }

  // Update item quantity
  const updateQuantity = (sweetId, quantity) => {
    if (quantity < 1) {
      removeFromCart(sweetId)
      return
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === sweetId ? { ...item, quantity } : item
      )
    )
  }

  // Clear entire cart
  const clearCart = () => {
    setCartItems([])
  }

  // Calculate cart total
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  )

  // Calculate item count
  const itemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  )

  // Toggle cart drawer
  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  // Close cart drawer
  const closeCart = () => {
    setIsCartOpen(false)
  }

  const value = {
    cartItems,
    cartTotal,
    itemCount,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    closeCart
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}