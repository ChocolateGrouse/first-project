'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Camera } from 'lucide-react'
import { InventoryList } from '@/components/inventory/InventoryList'
import { CategoryFilter } from '@/components/inventory/CategoryFilter'

const categories = [
  { id: 'all', name: 'All', icon: '📦' },
  { id: 'produce', name: 'Produce', icon: '🥬' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'meat', name: 'Meat', icon: '🥩' },
  { id: 'pantry', name: 'Pantry', icon: '🥫' },
  { id: 'frozen', name: 'Frozen', icon: '🧊' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
]

export default function InventoryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Inventory</h1>
          <p className="text-gray-500 mt-1">47 items in your kitchen</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/inventory/scan"
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium"
          >
            <Camera className="w-4 h-4" />
            Scan
          </Link>
          <Link
            href="/inventory/add"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search your inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Inventory List */}
      <InventoryList category={selectedCategory} search={searchQuery} />
    </div>
  )
}
