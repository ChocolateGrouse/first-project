'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, ChevronRight, Refrigerator, Clock } from 'lucide-react'
import { getInventoryItems, getDaysUntilExpiry, formatExpiryDisplay, type InventoryItem } from '@/lib/inventory-store'

function getUrgencyColor(daysLeft: number) {
  if (daysLeft < 0) return 'bg-gray-800 text-white border-gray-800'
  if (daysLeft <= 2) return 'bg-red-100 text-red-700 border-red-200'
  if (daysLeft <= 5) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

function getUrgencyLabel(daysLeft: number) {
  if (daysLeft < 0) return 'Expired'
  if (daysLeft === 0) return 'Today!'
  if (daysLeft === 1) return 'Tomorrow'
  return `${daysLeft} days`
}

export function ExpiringItems() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadItems()
  }, [])

  useEffect(() => {
    const handleUpdate = () => loadItems()
    window.addEventListener('inventory-updated', handleUpdate)
    return () => window.removeEventListener('inventory-updated', handleUpdate)
  }, [])

  const loadItems = () => {
    const allItems = getInventoryItems()
    // Filter items expiring in 7 days or already expired
    const expiring = allItems
      .map(item => ({
        ...item,
        daysLeft: getDaysUntilExpiry(item.expiryDate || item.expiry)
      }))
      .filter(item => item.daysLeft <= 7)
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 5) // Show top 5
    setItems(expiring)
  }

  if (!mounted) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-300" />
          <h2 className="font-semibold text-gray-900">Expiring Soon</h2>
        </div>
        <div className="p-8 flex justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-300" />
          <h2 className="font-semibold text-gray-900">Expiring Soon</h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Clock className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-gray-900 font-medium mb-1">All Clear!</p>
          <p className="text-gray-500 text-sm mb-4">
            No items expiring soon.<br />Your kitchen is in good shape.
          </p>
          <Link
            href="/inventory"
            className="inline-flex px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600"
          >
            View Inventory
          </Link>
        </div>
      </div>
    )
  }

  const expiredCount = items.filter(i => getDaysUntilExpiry(i.expiryDate || i.expiry) < 0).length
  const urgentCount = items.filter(i => {
    const days = getDaysUntilExpiry(i.expiryDate || i.expiry)
    return days >= 0 && days <= 2
  }).length

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${expiredCount > 0 ? 'text-red-500' : urgentCount > 0 ? 'text-amber-500' : 'text-gray-400'}`} />
          <h2 className="font-semibold text-gray-900">Expiring Soon</h2>
          {(expiredCount > 0 || urgentCount > 0) && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              expiredCount > 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {expiredCount > 0 ? `${expiredCount} expired` : `${urgentCount} urgent`}
            </span>
          )}
        </div>
        <Link
          href="/inventory"
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-50">
        {items.map((item) => {
          const daysLeft = getDaysUntilExpiry(item.expiryDate || item.expiry)
          return (
            <div
              key={item.id}
              className={`px-5 py-3 flex items-center justify-between hover:bg-gray-50 ${
                daysLeft < 0 ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-2xl ${daysLeft < 0 ? 'opacity-50' : ''}`}>{item.icon}</span>
                <div>
                  <p className={`font-medium ${daysLeft < 0 ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(daysLeft)}`}>
                {getUrgencyLabel(daysLeft)}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {expiredCount > 0 ? (
        <div className="px-5 py-3 bg-red-50 border-t border-red-100">
          <p className="text-sm text-red-700">
            <span className="font-medium">Action needed:</span> {expiredCount} item{expiredCount !== 1 ? 's' : ''} should be discarded.
          </p>
        </div>
      ) : urgentCount > 0 ? (
        <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
          <p className="text-sm text-amber-700">
            <span className="font-medium">Tip:</span> Use these items first to reduce food waste!
          </p>
        </div>
      ) : (
        <div className="px-5 py-3 bg-green-50 border-t border-green-100">
          <p className="text-sm text-green-700">
            <span className="font-medium">Looking good!</span> Plan meals around these items this week.
          </p>
        </div>
      )}
    </div>
  )
}
