import styles from './SweetCardSkeleton.module.css'

const SweetCardSkeleton = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImage}></div>
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonCategory}></div>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonDescription}></div>
            <div className={styles.skeletonRating}></div>
            <div className={styles.skeletonPrice}></div>
            <div className={styles.skeletonActions}>
              <div className={styles.skeletonButton}></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default SweetCardSkeleton