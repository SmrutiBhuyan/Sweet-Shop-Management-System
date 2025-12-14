import styles from './SkeletonLoader.module.css'

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, index) => index)

  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={styles.cardSkeleton}>
            <div className={styles.image}></div>
            <div className={styles.content}>
              <div className={styles.line} style={{ width: '30%' }}></div>
              <div className={styles.line} style={{ width: '80%' }}></div>
              <div className={styles.line} style={{ width: '60%' }}></div>
              <div className={styles.line} style={{ width: '40%' }}></div>
            </div>
          </div>
        )
      case 'text':
        return (
          <div className={styles.textSkeleton}>
            <div className={styles.line}></div>
            <div className={styles.line} style={{ width: '80%' }}></div>
            <div className={styles.line} style={{ width: '60%' }}></div>
          </div>
        )
      case 'table':
        return (
          <div className={styles.tableSkeleton}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.tableRow}>
                <div className={styles.tableCell}></div>
                <div className={styles.tableCell}></div>
                <div className={styles.tableCell}></div>
                <div className={styles.tableCell}></div>
              </div>
            ))}
          </div>
        )
      case 'list':
        return (
          <div className={styles.listSkeleton}>
            {[...Array(5)].map((_, i) => (
              <div key={i} className={styles.listItem}>
                <div className={styles.bullet}></div>
                <div className={styles.listContent}></div>
              </div>
            ))}
          </div>
        )
      default:
        return <div className={styles.defaultSkeleton}></div>
    }
  }

  return (
    <div className={styles.skeletonContainer}>
      {skeletons.map((index) => (
        <div key={index} className={styles.skeletonItem}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  )
}

export default SkeletonLoader