import { NextRequest, NextResponse } from 'next/server'
import { searchRecipesByIngredients, searchRecipes, getRecipeEmoji } from '@/lib/spoonacular'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const ingredients = searchParams.get('ingredients')
  const query = searchParams.get('query')
  const number = parseInt(searchParams.get('number') || '12', 10)

  try {
    // If ingredients provided, search by ingredients
    if (ingredients) {
      const ingredientList = ingredients.split(',').map(i => i.trim()).filter(Boolean)

      if (ingredientList.length === 0) {
        return NextResponse.json({ recipes: [] })
      }

      const recipes = await searchRecipesByIngredients(ingredientList, { number })

      // Transform to our format
      const formattedRecipes = recipes.map(recipe => ({
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
        emoji: getRecipeEmoji({ title: recipe.title }),
        matchedIngredients: recipe.usedIngredients.map(i => i.name),
        missingIngredients: recipe.missedIngredients.map(i => i.name),
        usedIngredientCount: recipe.usedIngredientCount,
        missedIngredientCount: recipe.missedIngredientCount,
        matchPercentage: Math.round(
          (recipe.usedIngredientCount / (recipe.usedIngredientCount + recipe.missedIngredientCount)) * 100
        ),
      }))

      return NextResponse.json({ recipes: formattedRecipes })
    }

    // If query provided, do text search
    if (query) {
      const result = await searchRecipes(query, { number })

      const formattedRecipes = result.results.map((recipe: any) => ({
        id: recipe.id,
        name: recipe.title,
        image: recipe.image,
        emoji: getRecipeEmoji({ title: recipe.title, dishTypes: recipe.dishTypes }),
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        healthScore: recipe.healthScore,
      }))

      return NextResponse.json({ recipes: formattedRecipes, total: result.totalResults })
    }

    return NextResponse.json({ recipes: [], message: 'Please provide ingredients or query parameter' })
  } catch (error) {
    console.error('Recipe search error:', error)
    return NextResponse.json(
      { error: 'Failed to search recipes' },
      { status: 500 }
    )
  }
}
