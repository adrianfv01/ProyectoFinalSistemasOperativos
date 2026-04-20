import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children?: ReactNode
  actions?: ReactNode
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  actions,
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            aria-hidden
          />

          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 380 }}
              className="surface-card w-full max-w-sm p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <h2 className="text-[15px] font-semibold tracking-tight text-[color:var(--text)]">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--text-muted)]">
                  {description}
                </p>
              )}
              {children && <div className="mt-3">{children}</div>}
              {actions && (
                <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  {actions}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
