import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SweetGrid from '../components/sweets/SweetGrid'
import { useSweets } from '../hooks/useSweets'
import styles from './ShopPage.module.css'

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  
  const {
    sweets,
    loading,
    error,
    refetch: refetchSweets
  } = useSweets({
    search: searchTerm,
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || 'name'
  })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {}
    if (searchTerm) params.search = searchTerm
    if (searchParams.get('category')) params.category = searchParams.get('category')
    if (searchParams.get('sort')) params.sort = searchParams.get('sort')
    setSearchParams(params)
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    if (!e.target.value) {
      searchParams.delete('search')
      setSearchParams(searchParams)
    }
  }

  const handleCategoryChange = (category) => {
    if (category) {
      searchParams.set('category', category)
    } else {
      searchParams.delete('category')
    }
    setSearchParams(searchParams)
  }

  const handleSortChange = (sort) => {
    if (sort) {
      searchParams.set('sort', sort)
    } else {
      searchParams.delete('sort')
    }
    setSearchParams(searchParams)
  }

  return (
    <div className={styles.shopPage}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Sweet Shop</h1>
          <p className={styles.heroDescription}>
            Discover our delicious collection of handcrafted sweets and desserts
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Sidebar Filters */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Search</h3>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Search sweets..."
                value={searchTerm}
                onChange={handleSearchChange}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </form>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Categories</h3>
            <div className={styles.categoryList}>
              <button
                onClick={() => handleCategoryChange('')}
                className={`${styles.categoryButton} ${!searchParams.get('category') ? styles.active : ''}`}
              >
                All Sweets
              </button>
              {['Chocolates', 'Candies', 'Cookies', 'Cakes', 'Desserts', 'Traditional'].map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category.toLowerCase())}
                  className={`${styles.categoryButton} ${searchParams.get('category') === category.toLowerCase() ? styles.active : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Sort By</h3>
            <div className={styles.sortList}>
              <button
                onClick={() => handleSortChange('name')}
                className={`${styles.sortButton} ${(!searchParams.get('sort') || searchParams.get('sort') === 'name') ? styles.active : ''}`}
              >
                Name (A-Z)
              </button>
              <button
                onClick={() => handleSortChange('price-low')}
                className={`${styles.sortButton} ${searchParams.get('sort') === 'price-low' ? styles.active : ''}`}
              >
                Price (Low to High)
              </button>
              <button
                onClick={() => handleSortChange('price-high')}
                className={`${styles.sortButton} ${searchParams.get('sort') === 'price-high' ? styles.active : ''}`}
              >
                Price (High to Low)
              </button>
              <button
                onClick={() => handleSortChange('stock')}
                className={`${styles.sortButton} ${searchParams.get('sort') === 'stock' ? styles.active : ''}`}
              >
                In Stock
              </button>
            </div>
          </div>

          <div className={styles.sidebarSection}>
            <h3 className={styles.sidebarTitle}>Quick Stats</h3>
            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Sweets:</span>
                <span className={styles.statValue}>{sweets.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>In Stock:</span>
                <span className={styles.statValue}>
                  {sweets.filter(s => s.quantityInStock > 0).length}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Low Stock:</span>
                <span className={styles.statValue}>
                  {sweets.filter(s => s.quantityInStock > 0 && s.quantityInStock <= 10).length}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.main}>
          <div className={styles.pageHeader}>
            <div>
              <h2 className={styles.pageTitle}>Our Sweets</h2>
              <p className={styles.pageDescription}>
                Browse through our collection of delicious sweets
              </p>
            </div>
            
            <div className={styles.headerActions}>
              <span className={styles.resultCount}>
                Showing {sweets.length} sweets
              </span>
            </div>
          </div>

          <SweetGrid
            sweets={sweets}
            loading={loading}
            error={error}
            onRetry={refetchSweets}
            emptyMessage="No sweets found matching your criteria"
            showFilters={false}
          />
        </main>
      </div>
    </div>
  )
}

export default ShopPage