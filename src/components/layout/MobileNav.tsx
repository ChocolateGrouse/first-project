'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Refrigerator,
  ChefHat,
  ShoppingCart,
  Plus
} from 'lucide-react'

const navigation = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Refrigerator },
  { name: 'Add', href: '/inventory/add', icon: Plus, highlight: true },
  { name: 'Recipes', href: '/recipes', icon: ChefHat },
  { name: 'Shopping', href: '/shopping', icon: ShoppingCart },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href

          if (item.highlight) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
