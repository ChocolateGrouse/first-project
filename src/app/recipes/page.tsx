'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, ChefHat, Clock, Check, X, Star, Play, Loader2, Refrigerator, Sparkles } from 'lucide-react'
import { getInventoryItems } from '@/lib/inventory-store'

interface Recipe {
  id: number
  name: string
  image: string
  emoji: string
  matchedIngredients: string[]
  missingIngredients: string[]
  matchPercentage: number
  readyInMinutes?: number
}

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'canMake' | 'almostCanMake'>('all')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inventoryIngredients, setInventoryIngredients] = useState<string[]>([])

  // Load recipes based on inventory
  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get ingredients from inventory
      const inventory = getInventoryItems()
      const ingredients = inventory.map(item => item.name)
      setInventoryIngredients(ingredients)

      if (ingredients.length === 0) {
        setRecipes([])
        setLoading(false)
        return
      }

      // Fetch recipes from API
      const response = await fetch(`/api/recipes/search?ingredients=${encodeURIComponent(ingredients.join(','))}`)

      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }

      const data = await response.json()
      setRecipes(data.recipes || [])
    } catch (err) {
      console.error('Error loading recipes:', err)
      setError('Failed to load recipes. Make sure your Spoonacular API key is configured.')
      // Fall back to mock data for demo purposes
      setRecipes(getMockRecipes())
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadRecipes() // Reset to inventory-based search
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/recipes/search?query=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()

      // Transform search results to match our format
      const transformed = data.recipes.map((r: any) => ({
        ...r,
        matchedIngredients: [],
        missingIngredients: [],
        matchPercentage: 0,
      }))

      setRecipes(transformed)
    } catch (err) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (filter === 'canMake') {
      return matchesSearch && recipe.missingIngredients.length === 0
    }
    if (filter === 'almostCanMake') {
      return matchesSearch && recipe.missingIngredients.length > 0 && recipe.missingIngredients.length <= 2
    }
    return matchesSearch
  })

  // Empty inventory state
  if (!loading && inventoryIngredients.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Find Recipes</h1>
          <p className="text-gray-500 mt-1">Discover recipes based on what&apos;s in your kitchen</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Refrigerator className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Your kitchen is empty</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Add items to your inventory first, then we&apos;ll find delicious recipes you can make!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/inventory/fridge"
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg font-medium hover:bg-cyan-600"
            >
              Scan Your Fridge
            </Link>
            <Link
              href="/inventory/add"
              className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50"
            >
              Add Items Manually
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Recipes</h1>
        <p className="text-gray-500 mt-1">
          {inventoryIngredients.length > 0
            ? `Based on ${inventoryIngredients.length} ingredients in your kitchen`
            : 'Discover recipes based on what you have'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setFilter('all'); loadRecipes() }}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            filter === 'all'
              ? 'bg-green-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
          }`}
        >
          All Recipes
        </button>
        <button
          onClick={() => setFilter('canMake')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
            filter === 'canMake'
              ? 'bg-green-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
          }`}
        >
          <Check className="w-4 h-4" />
          Can Make Now
        </button>
        <button
          onClick={() => setFilter('almostCanMake')}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            filter === 'almostCanMake'
              ? 'bg-green-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
          }`}
        >
          Almost There (1-2 missing)
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Finding delicious recipes...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700 text-sm">
          <p className="font-medium">Note: {error}</p>
          <p className="mt-1">Showing demo recipes for now.</p>
        </div>
      )}

      {/* Recipe Grid */}
      {!loading && filteredRecipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative h-40">
                {recipe.image ? (
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 h-full flex items-center justify-center">
                    <span className="text-6xl">{recipe.emoji}</span>
                  </div>
                )}

                {/* Match Badge */}
                {recipe.matchPercentage > 0 && (
                  <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                    recipe.matchPercentage === 100
                      ? 'bg-green-500 text-white'
                      : recipe.matchPercentage >= 70
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}>
                    {recipe.matchPercentage === 100 ? (
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Ready to cook!
                      </span>
                    ) : (
                      `${recipe.matchPercentage}% match`
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-2">{recipe.name}</h3>

                {recipe.readyInMinutes && (
                  <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.readyInMinutes} min
                    </span>
                  </div>
                )}

                {/* Ingredient Match */}
                {(recipe.matchedIngredients.length > 0 || recipe.missingIngredients.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <Check className="w-4 h-4" />
                        {recipe.matchedIngredients.length} you have
                      </span>
                      {recipe.missingIngredients.length > 0 && (
                        <span className="flex items-center gap-1 text-red-500">
                          <X className="w-4 h-4" />
                          {recipe.missingIngredients.length} missing
                        </span>
                      )}
                    </div>

                    {/* Missing Ingredients Preview */}
                    {recipe.missingIngredients.length > 0 && recipe.missingIngredients.length <= 3 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Need: {recipe.missingIngredients.slice(0, 3).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRecipes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-1">No recipes found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}

// Mock recipes for when API is not configured
function getMockRecipes(): Recipe[] {
  return [
    {
      id: 1,
      name: 'Spinach & Egg Scramble',
      image: '',
      emoji: '🍳',
      matchedIngredients: ['eggs', 'spinach', 'butter'],
      missingIngredients: [],
      matchPercentage: 100,
      readyInMinutes: 10,
    },
    {
      id: 2,
      name: 'Chicken Stir Fry',
      image: '',
      emoji: '🥘',
      matchedIngredients: ['chicken', 'rice', 'onion'],
      missingIngredients: ['sesame oil', 'ginger'],
      matchPercentage: 60,
      readyInMinutes: 25,
    },
    {
      id: 3,
      name: 'Grilled Cheese Deluxe',
      image: '',
      emoji: '🧀',
      matchedIngredients: ['bread', 'cheese', 'butter'],
      missingIngredients: [],
      matchPercentage: 100,
      readyInMinutes: 12,
    },
    {
      id: 4,
      name: 'Fresh Garden Salad',
      image: '',
      emoji: '🥗',
      matchedIngredients: ['spinach', 'tomatoes', 'onion'],
      missingIngredients: ['feta cheese'],
      matchPercentage: 75,
      readyInMinutes: 8,
    },
    {
      id: 5,
      name: 'Creamy Pasta Carbonara',
      image: '',
      emoji: '🍝',
      matchedIngredients: ['pasta', 'eggs', 'cheese'],
      missingIngredients: ['bacon', 'parmesan'],
      matchPercentage: 60,
      readyInMinutes: 30,
    },
    {
      id: 6,
      name: 'Tomato Rice Bowl',
      image: '',
      emoji: '🍚',
      matchedIngredients: ['rice', 'tomatoes', 'onion'],
      missingIngredients: [],
      matchPercentage: 100,
      readyInMinutes: 20,
    },
  ]
}
