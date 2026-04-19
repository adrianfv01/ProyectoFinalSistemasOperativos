import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  maxHeight?: string
}

export default function BottomSheet({
  open,
  onClose,
  title,
  children,
  maxHeight = '85dvh',
}: Props) {
  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  function handleDragEnd(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 500) onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden
          />

          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-[70] flex flex-col rounded-t-3xl border-t border-gray-700 bg-gray-900 shadow-2xl"
            style={{
              maxHeight,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            <div className="flex shrink-0 cursor-grab justify-center pt-3 active:cursor-grabbing">
              <span className="h-1.5 w-12 rounded-full bg-gray-600" aria-hidden />
            </div>

            {title && (
              <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3">
                <h2 className="text-base font-semibold text-gray-100">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
                  aria-label="Cerrar"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-2">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}
