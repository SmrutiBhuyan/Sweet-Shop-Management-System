import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaShoppingCart, FaEye, FaStar, FaRegStar, FaMinus, FaPlus } from 'react-icons/fa'
import { useCart } from '../../contexts/CartContext'
import styles from './SweetCard.module.css'

const SweetCard = ({ sweet }) => {
  const [isAdding, setIsAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    if (sweet.quantityInStock === 0) return
    
    setIsAdding(true)
    addToCart(sweet, quantity)
    
    // Show success feedback
    setTimeout(() => {
      setIsAdding(false)
    }, 1000)
  }

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value)
    if (value > 0 && value <= sweet.quantityInStock) {
      setQuantity(value)
    }
  }

  const incrementQuantity = () => {
    if (quantity < sweet.quantityInStock) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const renderRating = () => {
    const rating = sweet.rating || 4.5
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    return (
      <div className={styles.rating}>
        {[...Array(5)].map((_, i) => (
          <span key={i} className={styles.star}>
            {i < fullStars ? (
              <FaStar className={styles.starFilled} />
            ) : i === fullStars && hasHalfStar ? (
              <div className={styles.halfStar}>
                <FaStar className={styles.starFilled} />
                <FaRegStar className={styles.starOutline} />
              </div>
            ) : (
              <FaRegStar className={styles.starOutline} />
            )}
          </span>
        ))}
        <span className={styles.ratingCount}>({sweet.reviewCount || 24})</span>
      </div>
    )
  }

  return (
    <div className={styles.sweetCard}>
      {/* Sweet Image */}
      <div className={styles.imageContainer}>
        <img 
          src={sweet.imageUrl || 'https://placehold.co/400x300/FFE4E1/FF69B4?text=No+Image'} 
          alt={sweet.name}
          className={styles.image}
          loading="lazy"
        />
        
        {/* Stock Badge */}
        {sweet.quantityInStock <= 10 && sweet.quantityInStock > 0 && (
          <div className={styles.lowStockBadge}>
            Only {sweet.quantityInStock} left!
          </div>
        )}
        
        {sweet.quantityInStock === 0 && (
          <div className={styles.outOfStockBadge}>
            Out of Stock
          </div>
        )}
        
        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <Link 
            to={`/sweets/${sweet.id}`}
            className={styles.quickAction}
            aria-label="View details"
          >
            <FaEye />
          </Link>
        </div>
      </div>

      {/* Sweet Info */}
      <div className={styles.info}>
        {/* Category */}
        <span className={styles.category}>{sweet.category}</span>
        
        {/* Name */}
        <h3 className={styles.name}>
          <Link to={`/sweets/${sweet.id}`}>{sweet.name}</Link>
        </h3>
        
        {/* Description */}
        <p className={styles.description}>
          {sweet.description.length > 80 
            ? `${sweet.description.substring(0, 80)}...` 
            : sweet.description}
        </p>
        
        {/* Rating */}
        {renderRating()}
        
        {/* Price and Stock */}
        <div className={styles.priceStock}>
          <div className={styles.priceSection}>
            <span className={styles.price}>₹{sweet.price.toFixed(2)}</span>
            {sweet.originalPrice && (
              <span className={styles.originalPrice}>₹{sweet.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <div className={styles.stockStatus}>
            {sweet.quantityInStock > 0 ? (
              <span className={styles.inStock}>
                {sweet.quantityInStock > 50 ? 'In Stock' : `${sweet.quantityInStock} left`}
              </span>
            ) : (
              <span className={styles.outOfStock}>Out of Stock</span>
            )}
          </div>
        </div>

        {/* Quantity Selector and Add to Cart */}
        <div className={styles.actions}>
          {sweet.quantityInStock > 0 ? (
            <>
              <div className={styles.quantitySelector}>
                <button 
                  onClick={decrementQuantity}
                  className={styles.quantityButton}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  <FaMinus />
                </button>
                <input
                  type="number"
                  min="1"
                  max={sweet.quantityInStock}
                  value={quantity}
                  onChange={handleQuantityChange}
                  className={styles.quantityInput}
                  aria-label="Quantity"
                />
                <button 
                  onClick={incrementQuantity}
                  className={styles.quantityButton}
                  disabled={quantity >= sweet.quantityInStock}
                  aria-label="Increase quantity"
                >
                  <FaPlus />
                </button>
              </div>
              
              <button
                onClick={handleAddToCart}
                disabled={isAdding || sweet.quantityInStock === 0}
                className={`${styles.addToCartButton} ${isAdding ? styles.adding : ''}`}
                aria-label={`Add ${sweet.name} to cart`}
              >
                {isAdding ? (
                  <>
                    <span className={styles.spinner}></span>
                    Added!
                  </>
                ) : (
                  <>
                    <FaShoppingCart />
                    Add to Cart
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              disabled
              className={styles.notifyButton}
              aria-label="Notify when available"
            >
              Notify When Available
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SweetCard