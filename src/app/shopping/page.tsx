'use client'

import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Trash2, Check, ChevronDown, Package, ArrowRight } from 'lucide-react'
import {
  getShoppingItems,
  addShoppingItem,
  updateShoppingItem,
  deleteShoppingItem,
  clearCheckedShoppingItems,
  addMultipleItems,
  guessItemDetails,
  type ShoppingItem
} from '@/lib/inventory-store'

export default function ShoppingPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState('')
  const [showCompleted, setShowCompleted] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [isMoving, setIsMoving] = useState(false)

  // Load items from localStorage on mount
  useEffect(() => {
    setMounted(true)
    setItems(getShoppingItems())
  }, [])

  // Listen for shopping list updates
  useEffect(() => {
    const handleUpdate = () => setItems(getShoppingItems())
    window.addEventListener('shopping-updated', handleUpdate)
    return () => window.removeEventListener('shopping-updated', handleUpdate)
  }, [])

  const toggleItem = (id: number) => {
    const item = items.find(i => i.id === id)
    if (item) {
      updateShoppingItem(id, { checked: !item.checked })
      setItems(getShoppingItems())
    }
  }

  const handleDeleteItem = (id: number) => {
    deleteShoppingItem(id)
    setItems(getShoppingItems())
  }

  const handleAddItem = () => {
    if (newItem.trim()) {
      addShoppingItem({
        name: newItem.trim(),
        quantity: '1',
        checked: false,
        category: 'Other',
      })
      setItems(getShoppingItems())
      setNewItem('')
    }
  }

  const moveToInventory = () => {
    setIsMoving(true)

    const checkedItems = items.filter(item => item.checked)

    // Convert checked shopping items to inventory items
    const itemsToAdd = checkedItems.map(item => {
      const { category, icon } = guessItemDetails(item.name)
      return {
        name: item.name,
        category,
        quantity: 1,
        unit: item.quantity,
        expiry: '7 days',
        icon,
        status: 'fresh' as const,
      }
    })

    // Add to inventory
    addMultipleItems(itemsToAdd)

    // Remove checked items from shopping list
    clearCheckedShoppingItems()
    setItems(getShoppingItems())
    setIsMoving(false)
  }

  const uncheckedItems = items.filter(item => !item.checked)
  const checkedItems = items.filter(item => item.checked)

  // Group by recipe
  const groupedByRecipe: Record<string, ShoppingItem[]> = {}
  uncheckedItems.forEach(item => {
    const key = item.fromRecipe || 'Other items'
    if (!groupedByRecipe[key]) groupedByRecipe[key] = []
    groupedByRecipe[key].push(item)
  })

  // Don't render until mounted (avoids hydration mismatch)
  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-gray-500 mt-1">{uncheckedItems.length} items to buy</p>
        </div>
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-green-500" />
        </div>
      </div>

      {/* Add Item */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add an item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            onClick={handleAddItem}
            className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Shopping List */}
      {uncheckedItems.length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedByRecipe).map(([recipeName, recipeItems]) => (
            <div key={recipeName} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {recipeName !== 'Other items' && (
                <div className="px-4 py-3 bg-green-50 border-b border-green-100 flex items-center gap-2">
                  <span className="text-green-600 text-sm font-medium">For: {recipeName}</span>
                </div>
              )}
              <div className="divide-y divide-gray-50">
                {recipeItems.map((item) => (
                  <div
                    key={item.id}
                    className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-green-500"
                    >
                      {item.checked && <Check className="w-4 h-4 text-green-500" />}
                    </button>
                    <div className="flex-1">
                      <p className="text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.quantity}</p>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-1">Your shopping list is empty</h3>
          <p className="text-gray-500 text-sm">
            Add items manually or from recipe ingredients
          </p>
        </div>
      )}

      {/* Completed Items */}
      {checkedItems.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <span className="text-gray-500 font-medium">
              Completed ({checkedItems.length})
            </span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showCompleted ? 'rotate-180' : ''}`} />
          </button>

          {showCompleted && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {checkedItems.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-3 flex items-center gap-3 bg-gray-50"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-4 h-4 text-white" />
                  </button>
                  <div className="flex-1">
                    <p className="text-gray-400 line-through">{item.name}</p>
                    <p className="text-sm text-gray-400">{item.quantity}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Move to Inventory Button */}
      {checkedItems.length > 0 && (
        <button
          onClick={moveToInventory}
          disabled={isMoving}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 ${
            isMoving
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          <ArrowRight className="w-5 h-5" />
          {isMoving ? 'Moving...' : `Move ${checkedItems.length} items to Inventory`}
        </button>
      )}
    </div>
  )
}
