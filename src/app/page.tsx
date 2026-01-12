import { ExpiringItems } from '@/components/dashboard/ExpiringItems'
import { QuickRecipes } from '@/components/dashboard/QuickRecipes'
import { InventorySummary } from '@/components/dashboard/InventorySummary'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning!</h1>
        <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening in your kitchen</p>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Grid */}
      <InventorySummary />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Soon */}
        <ExpiringItems />

        {/* Quick Recipe Ideas */}
        <QuickRecipes />
      </div>
    </div>
  )
}
