import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../store/useStore'

export function Toast() {
  const toast = useStore((s) => s.toast)
  const hideToast = useStore((s) => s.hideToast)

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(hideToast, 3400)
    return () => clearTimeout(timer)
  }, [toast, hideToast])

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-50 lg:bottom-5 flex justify-center px-4"
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22 }}
            className="max-w-md rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-bg shadow-lg"
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
