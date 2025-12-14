import { useState, useEffect } from 'react'
import SweetCard from './SweetCard'
import SweetCardSkeleton from './SweetCardSkeleton'
import ErrorDisplay from '../errors/ErrorsDisplay'
import EmptyState from '../ui/EmptyState'
import styles from './SweetGrid.module.css'

const SweetGrid = ({ 
  sweets = [], 
  loading = false, 
  error = null, 
  onRetry = () => {},
  emptyMessage = "No sweets found",
  showFilters = true 
}) => {
  const [filteredSweets, setFilteredSweets] = useState(sweets)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Extract unique categories
  const categories = ['all', ...new Set(sweets.map(sweet => sweet.category))]

  // Filter and sort sweets
  useEffect(() => {
    let result = [...sweets]

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(sweet => sweet.category === selectedCategory)
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        result.sort((a, b) => b.price - a.price)
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'stock':
        result.sort((a, b) => b.quantityInStock - a.quantityInStock)
        break
      default:
        result.sort((a, b) => a.name.localeCompare(b.name))
    }

    setFilteredSweets(result)
  }, [sweets, selectedCategory, sortBy])

  if (loading) {
    return (
      <div className={styles.grid}>
        <SweetCardSkeleton count={6} />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorDisplay 
        error={error}
        onRetry={onRetry}
        title="Failed to load sweets"
        message="We couldn't load the sweets. Please try again."
      />
    )
  }

  if (sweets.length === 0) {
    return (
      <EmptyState
        icon="🍬"
        title="No Sweets Found"
        message={emptyMessage}
        actionText="Browse All Sweets"
        actionLink="/shop"
        showAction={true}
      />
    )
  }

  return (
    <div className={styles.container}>
      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <label htmlFor="category" className={styles.filterLabel}>
              Category:
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.filterSelect}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="sort" className={styles.filterLabel}>
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="name">Name (A-Z)</option>
              <option value="price-low">Price (Low to High)</option>
              <option value="price-high">Price (High to Low)</option>
              <option value="stock">Stock</option>
            </select>
          </div>

          <div className={styles.stats}>
            Showing {filteredSweets.length} of {sweets.length} sweets
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {filteredSweets.map(sweet => (
          <div key={sweet.id} className={styles.gridItem}>
            <SweetCard sweet={sweet} />
          </div>
        ))}
      </div>

      {filteredSweets.length === 0 && sweets.length > 0 && (
        <EmptyState
          icon="🔍"
          title="No matches found"
          message="No sweets match the selected filters. Try adjusting your criteria."
          actionText="Clear Filters"
          onAction={() => {
            setSelectedCategory('all')
            setSortBy('name')
          }}
          showAction={true}
        />
      )}
    </div>
  )
}

export default SweetGrid