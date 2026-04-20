import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function StickyActionBar({ children, className = '' }: Props) {
  return (
    <div
      className={`fixed inset-x-0 z-30 border-t border-[color:var(--border)] bg-[color:var(--bg-soft)]/90 px-3 py-2 backdrop-blur-xl lg:hidden ${className}`}
      style={{
        bottom: 'calc(4rem + env(safe-area-inset-bottom))',
      }}
      data-no-swipe
    >
      {children}
    </div>
  )
}
