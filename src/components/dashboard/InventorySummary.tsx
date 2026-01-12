'use client'

import { useState, useEffect } from 'react'
import { Refrigerator, AlertTriangle, CheckCircle, ShoppingCart } from 'lucide-react'
import { getInventoryItems, getShoppingItems } from '@/lib/inventory-store'

export function InventorySummary() {
  const [mounted, setMounted] = useState(false)
  const [counts, setCounts] = useState({
    total: 0,
    expiring: 0,
    fresh: 0,
    shopping: 0,
  })

  useEffect(() => {
    setMounted(true)
    updateCounts()

    // Listen for updates
    const handleUpdate = () => updateCounts()
    window.addEventListener('inventory-updated', handleUpdate)
    window.addEventListener('shopping-updated', handleUpdate)
    return () => {
      window.removeEventListener('inventory-updated', handleUpdate)
      window.removeEventListener('shopping-updated', handleUpdate)
    }
  }, [])

  const updateCounts = () => {
    const inventory = getInventoryItems()
    const shopping = getShoppingItems()
    setCounts({
      total: inventory.length,
      expiring: inventory.filter(item => item.status === 'expiring').length,
      fresh: inventory.filter(item => item.status === 'fresh' || item.status === 'good').length,
      shopping: shopping.filter(item => !item.checked).length,
    })
  }

  const stats = [
    {
      name: 'Total Items',
      value: mounted ? String(counts.total) : '0',
      icon: Refrigerator,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      name: 'Expiring Soon',
      value: mounted ? String(counts.expiring) : '0',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      name: 'Fresh & Good',
      value: mounted ? String(counts.fresh) : '0',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      name: 'Shopping List',
      value: mounted ? String(counts.shopping) : '0',
      icon: ShoppingCart,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white rounded-xl p-4 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">{stat.name}</p>
        </div>
      ))}
    </div>
  )
}
