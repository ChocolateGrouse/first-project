import Link from 'next/link'
import { ChefHat, ChevronRight, Clock, Check, Refrigerator } from 'lucide-react'

// Empty - no recipes until user has ingredients
const recipes: Array<{
  id: number
  name: string
  image: string
  time: string
  matchedIngredients: number
  totalIngredients: number
}> = []

export function QuickRecipes() {
  // Empty state
  if (recipes.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-gray-300" />
          <h2 className="font-semibold text-gray-900">Quick Recipe Ideas</h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <ChefHat className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Add ingredients to your inventory<br />and we&apos;ll suggest recipes you can make!
          </p>
          <Link
            href="/inventory/fridge"
            className="inline-flex px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm font-medium hover:bg-cyan-600"
          >
            Get Started
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
          <ChefHat className="w-5 h-5 text-green-500" />
          <h2 className="font-semibold text-gray-900">Quick Recipe Ideas</h2>
        </div>
        <Link
          href="/recipes"
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
        >
          Find more
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recipes/${recipe.id}`}
            className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors"
          >
            <div className="text-3xl mb-2">{recipe.image}</div>
            <h3 className="font-medium text-gray-900 text-sm leading-tight">
              {recipe.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {recipe.time}
              </span>
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Check className="w-3 h-3" />
                {recipe.matchedIngredients}/{recipe.totalIngredients}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-green-50 border-t border-green-100">
        <p className="text-sm text-green-700">
          <span className="font-medium">{recipes.length} recipes</span> you can make with what you have!
        </p>
      </div>
    </div>
  )
}
