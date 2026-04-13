import { ReactNode, useState } from 'react'
import { Menu, HardDrive } from 'lucide-react'
import Sidebar from './Sidebar'

export default function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col lg:ml-56">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-800 bg-gray-950/90 px-4 backdrop-blur-md lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-indigo-400" />
            <span className="text-sm font-bold tracking-tight text-gray-100">
              SimuladorSO
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
