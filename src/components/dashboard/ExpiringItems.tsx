import Link from 'next/link'
import { AlertTriangle, ChevronRight, Refrigerator } from 'lucide-react'

// Empty - no demo data
const expiringItems: Array<{
  id: number
  name: string
  category: string
  daysLeft: number
  icon: string
}> = []

function getUrgencyColor(daysLeft: number) {
  if (daysLeft <= 2) return 'bg-red-100 text-red-700 border-red-200'
  if (daysLeft <= 4) return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-green-100 text-green-700 border-green-200'
}

export function ExpiringItems() {
  // Empty state
  if (expiringItems.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-gray-300" />
          <h2 className="font-semibold text-gray-900">Expiring Soon</h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Refrigerator className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm mb-4">
            No items tracked yet.<br />Add items to see expiration alerts.
          </p>
          <Link
            href="/inventory/fridge"
            className="inline-flex px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600"
          >
            Scan Your Fridge
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h2 className="font-semibold text-gray-900">Expiring Soon</h2>
        </div>
        <Link
          href="/inventory?filter=expiring"
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Items List */}
      <div className="divide-y divide-gray-50">
        {expiringItems.map((item) => (
          <div
            key={item.id}
            className="px-5 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">{item.category}</p>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(item.daysLeft)}`}>
              {item.daysLeft} days
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-amber-50 border-t border-amber-100">
        <p className="text-sm text-amber-700">
          <span className="font-medium">Tip:</span> Use these items first to reduce food waste!
        </p>
      </div>
    </div>
  )
}
