import { ReactNode } from 'react'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import MobileTabBar from './MobileTabBar'
import SwipeNavigator from './SwipeNavigator'

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] bg-gray-950 text-gray-100">
      <Sidebar />

      <div className="flex flex-1 flex-col lg:ml-56">
        <MobileHeader />

        <main
          className="flex-1 overflow-y-auto p-4 sm:p-6"
          style={{ paddingBottom: 'calc(4.5rem + env(safe-area-inset-bottom) + 1rem)' }}
        >
          <SwipeNavigator>{children}</SwipeNavigator>
        </main>

        <MobileTabBar />
      </div>
    </div>
  )
}
