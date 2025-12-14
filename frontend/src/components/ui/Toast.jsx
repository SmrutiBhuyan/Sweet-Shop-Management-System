import toast from 'react-hot-toast'
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle } from 'react-icons/fa'
import styles from './Toast.module.css'

const Toast = {
  success: (message, options = {}) => {
    return toast.custom((t) => (
      <div
        className={`${styles.toast} ${styles.success} ${t.visible ? styles.enter : styles.leave}`}
        onClick={() => toast.dismiss(t.id)}
      >
        <div className={styles.icon}>
          <FaCheckCircle />
        </div>
        <div className={styles.content}>
          <div className={styles.title}>Success</div>
          <div className={styles.message}>{message}</div>
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => toast.dismiss(t.id)}
          aria-label="Close notification"
        >
          <FaTimesCircle />
        </button>
      </div>
    ), options)
  },

  error: (message, options = {}) => {
    return toast.custom((t) => (
      <div
        className={`${styles.toast} ${styles.error} ${t.visible ? styles.enter : styles.leave}`}
        onClick={() => toast.dismiss(t.id)}
      >
        <div className={styles.icon}>
          <FaExclamationCircle />
        </div>
        <div className={styles.content}>
          <div className={styles.title}>Error</div>
          <div className={styles.message}>{message}</div>
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => toast.dismiss(t.id)}
          aria-label="Close notification"
        >
          <FaTimesCircle />
        </button>
      </div>
    ), options)
  },

  info: (message, options = {}) => {
    return toast.custom((t) => (
      <div
        className={`${styles.toast} ${styles.info} ${t.visible ? styles.enter : styles.leave}`}
        onClick={() => toast.dismiss(t.id)}
      >
        <div className={styles.icon}>
          <FaInfoCircle />
        </div>
        <div className={styles.content}>
          <div className={styles.title}>Information</div>
          <div className={styles.message}>{message}</div>
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => toast.dismiss(t.id)}
          aria-label="Close notification"
        >
          <FaTimesCircle />
        </button>
      </div>
    ), options)
  },

  warning: (message, options = {}) => {
    return toast.custom((t) => (
      <div
        className={`${styles.toast} ${styles.warning} ${t.visible ? styles.enter : styles.leave}`}
        onClick={() => toast.dismiss(t.id)}
      >
        <div className={styles.icon}>
          <FaExclamationCircle />
        </div>
        <div className={styles.content}>
          <div className={styles.title}>Warning</div>
          <div className={styles.message}>{message}</div>
        </div>
        <button 
          className={styles.closeButton}
          onClick={() => toast.dismiss(t.id)}
          aria-label="Close notification"
        >
          <FaTimesCircle />
        </button>
      </div>
    ), options)
  },

  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    })
  }
}

export default Toast