'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, ChefHat, Clock, Check, X, Star, Play } from 'lucide-react'

// Mock recipe data
const recipes = [
  {
    id: 1,
    name: 'Spinach & Egg Scramble',
    image: '🍳',
    time: '10 min',
    difficulty: 'Easy',
    matchedIngredients: ['eggs', 'spinach', 'butter', 'salt'],
    missingIngredients: [],
    rating: 4.8,
    hasVideo: true,
  },
  {
    id: 2,
    name: 'Chicken Stir Fry',
    image: '🥘',
    time: '25 min',
    difficulty: 'Medium',
    matchedIngredients: ['chicken', 'rice', 'onion', 'garlic', 'soy sauce'],
    missingIngredients: ['sesame oil', 'ginger'],
    rating: 4.6,
    hasVideo: true,
  },
  {
    id: 3,
    name: 'Grilled Cheese Deluxe',
    image: '🧀',
    time: '12 min',
    difficulty: 'Easy',
    matchedIngredients: ['bread', 'cheese', 'butter'],
    missingIngredients: [],
    rating: 4.9,
    hasVideo: false,
  },
  {
    id: 4,
    name: 'Fresh Garden Salad',
    image: '🥗',
    time: '8 min',
    difficulty: 'Easy',
    matchedIngredients: ['spinach', 'tomatoes', 'onion', 'olive oil'],
    missingIngredients: ['feta cheese'],
    rating: 4.4,
    hasVideo: true,
  },
  {
    id: 5,
    name: 'Creamy Pasta Carbonara',
    image: '🍝',
    time: '30 min',
    difficulty: 'Medium',
    matchedIngredients: ['pasta', 'eggs', 'cheese'],
    missingIngredients: ['bacon', 'parmesan'],
    rating: 4.7,
    hasVideo: true,
  },
  {
    id: 6,
    name: 'Tomato Rice Bowl',
    image: '🍚',
    time: '20 min',
    difficulty: 'Easy',
    matchedIngredients: ['rice', 'tomatoes', 'onion', 'garlic'],
    missingIngredients: [],
    rating: 4.3,
    hasVideo: false,
  },
]

export default function RecipesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'canMake' | 'almostCanMake'>('all')

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Recipes</h1>
        <p className="text-gray-500 mt-1">Discover recipes based on what&apos;s in your kitchen</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
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
          Almost There
        </button>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg card-hover"
          >
            {/* Image */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 h-40 flex items-center justify-center relative">
              <span className="text-6xl">{recipe.image}</span>
              {recipe.hasVideo && (
                <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                  <Play className="w-3 h-3" fill="white" />
                  Video
                </div>
              )}
              {recipe.missingIngredients.length === 0 && (
                <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Ready to cook!
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4" fill="currentColor" />
                  <span className="text-sm font-medium">{recipe.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {recipe.time}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                  {recipe.difficulty}
                </span>
              </div>

              {/* Ingredient Match */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" />
                    {recipe.matchedIngredients.length} ingredients
                  </span>
                  {recipe.missingIngredients.length > 0 && (
                    <span className="flex items-center gap-1 text-red-500">
                      <X className="w-4 h-4" />
                      {recipe.missingIngredients.length} missing
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-1">No recipes found</h3>
          <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}
