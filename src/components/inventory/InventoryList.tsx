'use client'

import { useState, useEffect } from 'react'
import { MoreHorizontal, Calendar, Package, Trash2, Edit, X } from 'lucide-react'
import { getInventoryItems, deleteInventoryItem, updateInventoryItem, type InventoryItem } from '@/lib/inventory-store'

function getStatusBadge(status: string) {
  switch (status) {
    case 'expiring':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'good':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'fresh':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

interface InventoryListProps {
  category: string
  search: string
}

export function InventoryList({ category, search }: InventoryListProps) {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [menuOpen, setMenuOpen] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editForm, setEditForm] = useState({ name: '', quantity: '', unit: '', expiry: '' })

  // Load items from localStorage on mount
  useEffect(() => {
    setMounted(true)
    setItems(getInventoryItems())
  }, [])

  // Listen for inventory updates from other components
  useEffect(() => {
    const handleUpdate = () => setItems(getInventoryItems())
    window.addEventListener('inventory-updated', handleUpdate)
    window.addEventListener('focus', handleUpdate)
    return () => {
      window.removeEventListener('inventory-updated', handleUpdate)
      window.removeEventListener('focus', handleUpdate)
    }
  }, [])

  const filteredItems = items.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleDelete = (id: number) => {
    deleteInventoryItem(id)
    setItems(getInventoryItems())
    setMenuOpen(null)
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      expiry: item.expiry,
    })
    setMenuOpen(null)
  }

  const handleSaveEdit = () => {
    if (editingItem) {
      updateInventoryItem(editingItem.id, {
        name: editForm.name,
        quantity: Number(editForm.quantity) || 1,
        unit: editForm.unit,
        expiry: editForm.expiry,
      })
      setItems(getInventoryItems())
      setEditingItem(null)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = () => setMenuOpen(null)
    if (menuOpen !== null) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [menuOpen])

  // Don't render until mounted (avoids hydration mismatch)
  if (!mounted) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-2">Your kitchen is empty</h3>
        <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
          Start by scanning your fridge, uploading a receipt, or manually adding items to track what you have.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/inventory/fridge"
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600"
          >
            Scan Fridge
          </a>
          <a
            href="/inventory/add"
            className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
          >
            Add Manually
          </a>
        </div>
      </div>
    )
  }

  // No results after filtering
  if (filteredItems.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 mb-1">No items found</h3>
        <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <>
      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Edit Item</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires in</label>
                <input
                  type="text"
                  value={editForm.expiry}
                  onChange={(e) => setEditForm({ ...editForm, expiry: e.target.value })}
                  placeholder="e.g., 7 days"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Grid */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-100">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 hover:bg-gray-50 transition-colors relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setMenuOpen(menuOpen === item.id ? null : item.id)
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpen === item.id && (
                    <div
                      className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  Expires in {item.expiry}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
