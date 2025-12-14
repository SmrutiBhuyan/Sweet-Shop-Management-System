import { Link } from 'react-router-dom'
import styles from './EmptyState.module.css'

const EmptyState = ({ 
  icon = '🍬',
  title = "No items found",
  message = "There are no items to display at the moment.",
  actionText = "Browse Shop",
  actionLink = "/shop",
  showAction = true
}) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyMessage}>{message}</p>
      {showAction && actionLink && (
        <Link to={actionLink} className={styles.emptyAction}>
          {actionText}
        </Link>
      )}
    </div>
  )
}

export default EmptyState