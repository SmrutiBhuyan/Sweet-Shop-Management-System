import { FaExclamationTriangle, FaRedo } from 'react-icons/fa'
import styles from './ErrorDisplay.module.css'

const ErrorDisplay = ({ 
  error, 
  onRetry, 
  title = "Something went wrong",
  message = "We're having trouble loading this content.",
  showRetry = true 
}) => {
  return (
    <div className={styles.errorDisplay}>
      <div className={styles.errorIcon}>
        <FaExclamationTriangle />
      </div>
      <h3 className={styles.errorTitle}>{title}</h3>
      <p className={styles.errorMessage}>{message}</p>
      
      {error && import.meta.env.DEV && (
        <details className={styles.errorDetails}>
          <summary>Error Details</summary>
          <pre className={styles.errorText}>{error.message || error.toString()}</pre>
        </details>
      )}
      
      {showRetry && onRetry && (
        <button onClick={onRetry} className={styles.retryButton}>
          <FaRedo /> Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorDisplay