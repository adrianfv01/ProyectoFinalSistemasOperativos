import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
}

export default function StickyActionBar({ children, className = '' }: Props) {
  return (
    <div
      className={`fixed inset-x-0 z-30 border-t border-gray-800 bg-gray-950/95 px-3 py-2 backdrop-blur-md lg:hidden ${className}`}
      style={{
        bottom: 'calc(4rem + env(safe-area-inset-bottom))',
      }}
      data-no-swipe
    >
      {children}
    </div>
  )
}
