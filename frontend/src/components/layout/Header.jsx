import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FaShoppingCart, FaUser, FaBars, FaTimes, FaChevronDown } from 'react-icons/fa'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import CartDrawer from '../cart/CartDrawer'
import styles from './Header.module.css'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const { itemCount, toggleCart } = useCart()

  const handleLogout = () => {
    logout()
    window.location.href = '/'
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
  }

  return (
    <>
      <header className={styles.header}>
        <div className={`container ${styles.headerContainer}`}>
          {/* Logo */}
          <div className={styles.logo}>
            <Link to="/" className={styles.logoLink}>
              <span className={styles.logoIcon}>🍬</span>
              <span className={styles.logoText}>Sweet Shop</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className={styles.desktopNav}>
            <ul className={styles.navList}>
              <li><Link to="/" className={styles.navLink}>Home</Link></li>
              <li><Link to="/shop" className={styles.navLink}>Shop</Link></li>
              
              {user && (
                <>
                  <li><Link to="/dashboard" className={styles.navLink}>Dashboard</Link></li>
                  {user.role === 'admin' && (
                    <li><Link to="/admin" className={styles.navLink}>Admin</Link></li>
                  )}
                </>
              )}
            </ul>
          </nav>

          {/* User Actions */}
          <div className={styles.userActions}>
            {/* Cart Button */}
            <button 
              onClick={toggleCart} 
              className={styles.cartButton}
              aria-label={`Shopping Cart with ${itemCount} items`}
            >
              <FaShoppingCart />
              {itemCount > 0 && (
                <span className={styles.cartCount}>{itemCount}</span>
              )}
            </button>
            
            {/* User Menu */}
            {user ? (
              <div className={styles.userMenu}>
                <button 
                  onClick={toggleUserMenu}
                  className={styles.userButton}
                  aria-label="User menu"
                >
                  <div className={styles.userAvatar}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className={styles.userName}>{user.name}</span>
                  <FaChevronDown className={`${styles.chevron} ${isUserMenuOpen ? styles.rotated : ''}`} />
                </button>
                
                {isUserMenuOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.userInfo}>
                      <div className={styles.dropdownAvatar}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.dropdownName}>{user.name}</div>
                        <div className={styles.dropdownEmail}>{user.email}</div>
                        <div className={styles.dropdownRole}>
                          {user.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                        </div>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider}></div>
                    <Link 
                      to="/dashboard" 
                      className={styles.dropdownItem}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>📊 Dashboard</span>
                    </Link>
                    <Link 
                      to="/dashboard/orders" 
                      className={styles.dropdownItem}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>📦 My Orders</span>
                    </Link>
                    <Link 
                      to="/dashboard/profile" 
                      className={styles.dropdownItem}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <span>👤 Profile Settings</span>
                    </Link>
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        className={styles.dropdownItem}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <span>⚙️ Admin Panel</span>
                      </Link>
                    )}
                    <div className={styles.dropdownDivider}></div>
                    <button 
                      onClick={handleLogout} 
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                    >
                      <span>🚪 Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.authButtons}>
                <Link to="/login" className={`${styles.button} ${styles.buttonOutline}`}>
                  Login
                </Link>
                <Link to="/register" className={`${styles.button} ${styles.buttonPrimary}`}>
                  Register
                </Link>
              </div>
            )}
            
            {/* Mobile Menu Button */}
            <button 
              className={styles.mobileMenuButton} 
              onClick={toggleMenu}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <nav className={styles.mobileNav}>
              <ul className={styles.mobileNavList}>
                <li><Link to="/" className={styles.mobileNavLink} onClick={toggleMenu}>Home</Link></li>
                <li><Link to="/shop" className={styles.mobileNavLink} onClick={toggleMenu}>Shop</Link></li>
                
                {user && (
                  <>
                    <li><Link to="/dashboard" className={styles.mobileNavLink} onClick={toggleMenu}>Dashboard</Link></li>
                    {user.role === 'admin' && (
                      <li><Link to="/admin" className={styles.mobileNavLink} onClick={toggleMenu}>Admin</Link></li>
                    )}
                    <li>
                      <button onClick={toggleCart} className={styles.mobileCartButton}>
                        <FaShoppingCart /> Cart ({itemCount})
                      </button>
                    </li>
                  </>
                )}
                
                {!user ? (
                  <>
                    <li><Link to="/login" className={styles.mobileNavLink} onClick={toggleMenu}>Login</Link></li>
                    <li><Link to="/register" className={styles.mobileNavLink} onClick={toggleMenu}>Register</Link></li>
                  </>
                ) : (
                  <>
                    <li className={styles.mobileUserInfo}>
                      <div className={styles.mobileUserAvatar}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className={styles.mobileUserName}>{user.name}</div>
                        <div className={styles.mobileUserEmail}>{user.email}</div>
                      </div>
                    </li>
                    <li>
                      <button onClick={handleLogout} className={styles.mobileLogoutButton}>
                        🚪 Logout
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          )}
        </div>
      </header>

      {/* Cart Drawer Component */}
      <CartDrawer />
    </>
  )
}

export default Header