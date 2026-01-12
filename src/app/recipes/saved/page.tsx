'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Heart, Clock, Star, ChefHat } from 'lucide-react'
import { getSavedRecipes, unsaveRecipe } from '@/lib/inventory-store'

// All available recipes (same as in recipes page)
const allRecipes = [
  {
    id: 1,
    name: 'Spinach & Egg Scramble',
    image: '🍳',
    time: '10 min',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Chicken Stir Fry',
    image: '🥘',
    time: '25 min',
    rating: 4.6,
  },
  {
    id: 3,
    name: 'Grilled Cheese Deluxe',
    image: '🧀',
    time: '12 min',
    rating: 4.9,
  },
  {
    id: 4,
    name: 'Fresh Garden Salad',
    image: '🥗',
    time: '8 min',
    rating: 4.4,
  },
  {
    id: 5,
    name: 'Creamy Pasta Carbonara',
    image: '🍝',
    time: '30 min',
    rating: 4.7,
  },
  {
    id: 6,
    name: 'Tomato Rice Bowl',
    image: '🍚',
    time: '20 min',
    rating: 4.3,
  },
]

export default function SavedRecipesPage() {
  const [savedRecipeIds, setSavedRecipeIds] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setSavedRecipeIds(getSavedRecipes())
  }, [])

  const handleUnsave = (e: React.MouseEvent, recipeId: number) => {
    e.preventDefault()
    e.stopPropagation()
    unsaveRecipe(recipeId)
    setSavedRecipeIds(getSavedRecipes())
  }

  const savedRecipes = allRecipes.filter(recipe => savedRecipeIds.includes(recipe.id))

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/recipes"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recipes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Saved Recipes</h1>
        <p className="text-gray-500 mt-1">Your favorite recipes in one place</p>
      </div>

      {savedRecipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {savedRecipes.map((recipe) => (
            <Link
              key={recipe.id}
              href={`/recipes/${recipe.id}`}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg card-hover"
            >
              <div className="bg-gradient-to-br from-green-50 to-green-100 h-40 flex items-center justify-center relative">
                <span className="text-6xl">{recipe.image}</span>
                <button
                  onClick={(e) => handleUnsave(e, recipe.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full text-red-500 shadow-sm hover:bg-red-50"
                >
                  <Heart className="w-5 h-5" fill="currentColor" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">{recipe.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {recipe.time}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-amber-500">
                    <Star className="w-4 h-4" fill="currentColor" />
                    {recipe.rating}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <ChefHat className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-1">No saved recipes yet</h3>
          <p className="text-gray-500 text-sm mb-4">
            Start exploring and save recipes you love!
          </p>
          <Link
            href="/recipes"
            className="inline-flex px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
          >
            Explore Recipes
          </Link>
        </div>
      )}
    </div>
  )
}
