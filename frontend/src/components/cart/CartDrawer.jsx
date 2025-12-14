import { useState } from 'react'
import { FaTimes, FaShoppingCart, FaTrash, FaPlus, FaMinus } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import styles from './CartDrawer.module.css'

const CartDrawer = () => {
  const { 
    cartItems, 
    cartTotal, 
    isCartOpen, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    closeCart 
  } = useCart()
  
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = () => {
    setIsCheckingOut(true)
    // Simulate checkout process
    setTimeout(() => {
      setIsCheckingOut(false)
      clearCart()
      closeCart()
      alert('Order placed successfully! Thank you for your purchase.')
    }, 1500)
  }

  const handleQuantityChange = (itemId, change) => {
    const item = cartItems.find(item => item.id === itemId)
    if (item) {
      const newQuantity = item.quantity + change
      if (newQuantity > 0) {
        updateQuantity(itemId, newQuantity)
      } else {
        removeFromCart(itemId)
      }
    }
  }

  if (!isCartOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={closeCart} />
      
      {/* Cart Drawer */}
      <div className={styles.cartDrawer}>
        {/* Cart Header */}
        <div className={styles.cartHeader}>
          <div className={styles.cartTitle}>
            <FaShoppingCart />
            <h2>Your Sweet Cart</h2>
          </div>
          <button onClick={closeCart} className={styles.closeButton}>
            <FaTimes />
          </button>
        </div>

        {/* Cart Items */}
        <div className={styles.cartItems}>
          {cartItems.length === 0 ? (
            <div className={styles.emptyCart}>
              <div className={styles.emptyCartIcon}>🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add some sweets to get started!</p>
              <button onClick={closeCart} className={styles.continueShopping}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className={styles.itemsList}>
                {cartItems.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <div className={styles.itemImage}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className={styles.imagePlaceholder}>🍬</div>
                      )}
                    </div>
                    
                    <div className={styles.itemDetails}>
                      <h4 className={styles.itemName}>{item.name}</h4>
                      <p className={styles.itemPrice}>₹{item.price.toFixed(2)} each</p>
                      
                      <div className={styles.itemActions}>
                        <div className={styles.quantityControls}>
                          <button 
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className={styles.quantityButton}
                            aria-label="Decrease quantity"
                          >
                            <FaMinus />
                          </button>
                          <span className={styles.quantity}>{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className={styles.quantityButton}
                            disabled={item.quantity >= item.stock}
                            aria-label="Increase quantity"
                          >
                            <FaPlus />
                          </button>
                        </div>
                        
                        <div className={styles.itemTotal}>
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className={styles.removeButton}
                          aria-label="Remove item"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clear Cart Button */}
              <button onClick={clearCart} className={styles.clearCartButton}>
                <FaTrash /> Clear Cart
              </button>
            </>
          )}
        </div>

        {/* Cart Footer */}
        {cartItems.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.cartSummary}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tax (5%)</span>
                <span>₹{(cartTotal * 0.05).toFixed(2)}</span>
              </div>
              <div className={styles.summaryDivider}></div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>₹{(cartTotal * 1.05).toFixed(2)}</span>
              </div>
            </div>

            <div className={styles.checkoutButtons}>
              <Link to="/shop" onClick={closeCart} className={styles.continueButton}>
                Continue Shopping
              </Link>
              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`${styles.checkoutButton} ${isCheckingOut ? styles.checkingOut : ''}`}
              >
                {isCheckingOut ? (
                  <>
                    <span className={styles.spinner}></span>
                    Processing...
                  </>
                ) : (
                  `Checkout ₹${(cartTotal * 1.05).toFixed(2)}`
                )}
              </button>
            </div>

            <p className={styles.securityNote}>
              🔒 Secure checkout · Your payment information is encrypted
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default CartDrawer