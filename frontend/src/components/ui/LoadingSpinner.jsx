import styles from './LoadingSpinner.module.css'

const LoadingSpinner = ({ size = 'medium', color = 'primary', fullPage = false }) => {
  const sizeClass = styles[size] || styles.medium
  const colorClass = styles[color] || styles.primary
  
  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <div className={`${styles.spinner} ${sizeClass} ${colorClass}`}></div>
      </div>
    )
  }
  
  return (
    <div className={`${styles.spinner} ${sizeClass} ${colorClass}`}></div>
  )
}

export default LoadingSpinner