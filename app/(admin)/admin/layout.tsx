import Link from 'next/link'
import { Package, LayoutDashboard, Settings } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <aside className="w-64 border-r bg-gray-50/50 p-4">
        <div className="mb-8">
          <h1 className="text-xl font-bold">Allin1 Admin</h1>
        </div>

        <nav className="space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <Package className="h-4 w-4" />
            Products
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}
