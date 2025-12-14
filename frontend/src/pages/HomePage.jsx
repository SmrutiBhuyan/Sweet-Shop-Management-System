import { Link } from 'react-router-dom'
import { FaArrowRight, FaStar } from 'react-icons/fa'
import SweetGrid from '../components/sweets/SweetGrid'
import Button from '../components/ui/Button'
import styles from './HomePage.module.css'

// Mock data - replace with API call later
const featuredSweets = [
  {
    id: '1',
    name: 'Chocolate Truffle Delight',
    description: 'Rich dark chocolate truffle with a soft ganache center, dusted with cocoa powder.',
    category: 'Chocolates',
    price: 35.50,
    quantityInStock: 15,
    imageUrl: 'https://placehold.co/400x300/4A0404/FFFFFF?text=Chocolate+Truffle',
    rating: 4.8,
    reviewCount: 42
  },
  {
    id: '2',
    name: 'Strawberry Cheesecake Slice',
    description: 'Creamy cheesecake on a buttery biscuit base, topped with fresh strawberry compote.',
    category: 'Cakes',
    price: 120.00,
    quantityInStock: 8,
    imageUrl: 'https://placehold.co/400x300/FFC0CB/000000?text=Strawberry+Cheesecake',
    rating: 4.9,
    reviewCount: 28
  },
  {
    id: '3',
    name: 'Classic Chocolate Chip Cookies',
    description: 'Freshly baked cookies with melty chocolate chips, crispy edges and chewy centers.',
    category: 'Cookies',
    price: 15.00,
    quantityInStock: 50,
    imageUrl: 'https://placehold.co/400x300/8B4513/FFFFFF?text=Chocolate+Chip+Cookie',
    rating: 4.7,
    reviewCount: 56
  }
]

const HomePage = () => {
  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Welcome to the <span className={styles.highlight}>Sweetest</span> Shop in Town
            </h1>
            <p className={styles.heroDescription}>
              Indulge in our handcrafted sweets, made with love and the finest ingredients. 
              From decadent chocolates to fluffy pastries, we have something for every sweet tooth.
            </p>
            <div className={styles.heroButtons}>
              <Link to="/shop">
                <Button variant="primary" size="large">
                  Shop Now <FaArrowRight />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="large">
                  Join Sweet Club
                </Button>
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.imagePlaceholder}>
              🍰🍪🍫
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Why Choose Our Sweet Shop?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🍫</div>
              <h3 className={styles.featureTitle}>Premium Quality</h3>
              <p className={styles.featureDescription}>
                We use only the finest ingredients sourced from trusted suppliers.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎨</div>
              <h3 className={styles.featureTitle}>Handcrafted</h3>
              <p className={styles.featureDescription}>
                Each sweet is carefully crafted by our expert confectioners.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🚚</div>
              <h3 className={styles.featureTitle}>Fast Delivery</h3>
              <p className={styles.featureDescription}>
                Fresh sweets delivered to your doorstep within 24 hours.
              </p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💝</div>
              <h3 className={styles.featureTitle}>Custom Orders</h3>
              <p className={styles.featureDescription}>
                Special occasions? We create custom sweets for your events.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Sweets */}
      <section className={styles.featuredSweets}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Sweets</h2>
            <Link to="/shop" className={styles.viewAll}>
              View All <FaArrowRight />
            </Link>
          </div>
          <SweetGrid sweets={featuredSweets} loading={false} />
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials}>
        <div className="container">
          <h2 className={styles.sectionTitle}>What Our Customers Say</h2>
          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={styles.starIcon} />
                ))}
              </div>
              <p className={styles.testimonialText}>
                "The best chocolates I've ever had! Will definitely order again."
              </p>
              <div className={styles.testimonialAuthor}>
                <strong>Priya Sharma</strong>
                <span>Regular Customer</span>
              </div>
            </div>
            
            <div className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={styles.starIcon} />
                ))}
              </div>
              <p className={styles.testimonialText}>
                "Perfect for my daughter's birthday party. Everyone loved them!"
              </p>
              <div className={styles.testimonialAuthor}>
                <strong>Raj Patel</strong>
                <span>Event Organizer</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage