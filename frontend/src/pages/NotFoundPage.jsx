import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

const NotFoundPage = () => {
  return (
    <div className={styles.notFound}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <h2 className={styles.subtitle}>Sweet Not Found!</h2>
        <p className={styles.description}>
          Oops! The page you're looking for seems to have melted away.
        </p>
        <Link to="/" className={styles.button}>
          Back to Sweet Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage