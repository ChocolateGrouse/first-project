'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Refrigerator,
  ChefHat,
  ShoppingCart,
  User,
  Settings,
  Plus,
  Upload,
  Camera,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Inventory', href: '/inventory', icon: Refrigerator },
  { name: 'Find Recipes', href: '/recipes', icon: ChefHat },
  { name: 'Shopping List', href: '/shopping', icon: ShoppingCart },
]

const quickActions = [
  { name: 'Add Item', href: '/inventory/add', icon: Plus },
  { name: 'Scan Fridge', href: '/inventory/fridge', icon: Refrigerator },
  { name: 'Scan Receipt', href: '/inventory/scan', icon: Camera },
  { name: 'Upload CSV', href: '/inventory/upload', icon: Upload },
]

const bottomNav = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
          <ChefHat className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-gray-900">Smart Kitchen</h1>
          <p className="text-xs text-gray-500">Track & Cook</p>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          )
        })}

        {/* Quick Actions */}
        <div className="pt-4">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Quick Actions
          </p>
          <div className="mt-2 space-y-1">
            {quickActions.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
              {item.name}
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
