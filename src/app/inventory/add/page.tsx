'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Package, Hash } from 'lucide-react'
import { addInventoryItem, guessItemDetails, getExpiryStatus } from '@/lib/inventory-store'

const categories = [
  { id: 'produce', name: 'Produce', icon: '🥬' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'meat', name: 'Meat & Seafood', icon: '🥩' },
  { id: 'pantry', name: 'Pantry', icon: '🥫' },
  { id: 'frozen', name: 'Frozen', icon: '🧊' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
  { id: 'snacks', name: 'Snacks', icon: '🍿' },
]

const units = ['count', 'lbs', 'oz', 'gallon', 'quart', 'cup', 'bag', 'box', 'can', 'bottle']

// Helper to get default expiry date (7 days from now)
function getDefaultExpiryDate(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().split('T')[0]
}

export default function AddItemPage() {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '1',
    unit: 'count',
    expiryDate: getDefaultExpiryDate(),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Please enter an item name')
      return
    }

    setIsAdding(true)

    // Get icon based on name or category
    const guessed = guessItemDetails(formData.name)
    const category = formData.category || guessed.category
    const icon = categories.find(c => c.id === category)?.icon || guessed.icon

    addInventoryItem({
      name: formData.name.trim(),
      category,
      quantity: Number(formData.quantity) || 1,
      unit: formData.unit,
      expiry: formData.expiryDate,
      expiryDate: formData.expiryDate,
      icon,
      status: getExpiryStatus(formData.expiryDate),
    })

    // Redirect to inventory
    setTimeout(() => {
      router.push('/inventory')
    }, 300)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/inventory"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Item</h1>
        <p className="text-gray-500 mt-1">Add a new item to your kitchen inventory</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Item Name */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Item Name *</span>
            <div className="mt-2 relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                required
                placeholder="e.g., Milk, Eggs, Chicken..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg"
              />
            </div>
          </label>
        </div>

        {/* Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <span className="text-sm font-medium text-gray-700">Category (optional)</span>
          <p className="text-sm text-gray-500 mb-3">We&apos;ll guess if you don&apos;t select one</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setFormData({ ...formData, category: formData.category === category.id ? '' : category.id })}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-left transition-colors ${
                  formData.category === category.id
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and Unit */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Quantity</span>
              <div className="mt-2 relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Unit</span>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="mt-2 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              >
                {units.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Expiry Date */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Expiration Date</span>
            <div className="mt-2 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              When does this item expire?
            </p>
          </label>
          {/* Quick date buttons */}
          <div className="flex gap-2 mt-3">
            {[3, 7, 14, 30].map((days) => {
              const date = new Date()
              date.setDate(date.getDate() + days)
              const dateStr = date.toISOString().split('T')[0]
              return (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFormData({ ...formData, expiryDate: dateStr })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    formData.expiryDate === dateStr
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {days} days
                </button>
              )
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Link
            href="/inventory"
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isAdding}
            className={`flex-1 py-3 px-4 rounded-lg font-medium ${
              isAdding
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isAdding ? 'Adding...' : 'Add to Inventory'}
          </button>
        </div>
      </form>
    </div>
  )
}
