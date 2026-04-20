import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import MobileTabBar from './MobileTabBar'
import SwipeNavigator from './SwipeNavigator'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[100dvh] text-[color:var(--text)]">
      <Sidebar />

      <div className="flex flex-1 flex-col lg:ml-60">
        <MobileHeader />

        <main
          className="relative flex-1 overflow-y-auto px-4 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pt-8"
          style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom) + 1rem)' }}
        >
          <div className="mx-auto w-full max-w-6xl">
            <SwipeNavigator>{children}</SwipeNavigator>
          </div>
        </main>

        <MobileTabBar />
      </div>
    </div>
  )
}
