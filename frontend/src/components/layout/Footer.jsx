import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa'
import styles from './Footer.module.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        {/* Brand Section */}
        <div className={styles.brandSection}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>🍬</span>
            <span className={styles.logoText}>Sweet Shop</span>
          </div>
          <p className={styles.tagline}>
            The sweetest treats delivered to your doorstep
          </p>
          <div className={styles.socialLinks}>
            <a href="#" aria-label="Facebook" className={styles.socialLink}>
              <FaFacebook />
            </a>
            <a href="#" aria-label="Twitter" className={styles.socialLink}>
              <FaTwitter />
            </a>
            <a href="#" aria-label="Instagram" className={styles.socialLink}>
              <FaInstagram />
            </a>
            <a href="#" aria-label="GitHub" className={styles.socialLink}>
              <FaGithub />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.linksSection}>
          <h3 className={styles.sectionTitle}>Quick Links</h3>
          <ul className={styles.linksList}>
            <li><a href="/shop" className={styles.link}>Shop All</a></li>
            <li><a href="/shop?category=chocolates" className={styles.link}>Chocolates</a></li>
            <li><a href="/shop?category=cakes" className={styles.link}>Cakes</a></li>
            <li><a href="/shop?category=cookies" className={styles.link}>Cookies</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className={styles.linksSection}>
          <h3 className={styles.sectionTitle}>Support</h3>
          <ul className={styles.linksList}>
            <li><a href="/contact" className={styles.link}>Contact Us</a></li>
            <li><a href="/faq" className={styles.link}>FAQ</a></li>
            <li><a href="/shipping" className={styles.link}>Shipping Policy</a></li>
            <li><a href="/returns" className={styles.link}>Returns</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className={styles.newsletterSection}>
          <h3 className={styles.sectionTitle}>Stay Sweetened</h3>
          <p className={styles.newsletterText}>
            Subscribe to get updates on new arrivals and sweet deals!
          </p>
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Your email"
              className={styles.newsletterInput}
              required
            />
            <button type="submit" className={styles.newsletterButton}>
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className={styles.copyright}>
        <div className="container">
          <p className={styles.copyrightText}>
            © {currentYear} Sweet Shop Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer