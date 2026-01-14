import { NextRequest, NextResponse } from 'next/server'
import { getRecipeDetails, getRecipeEmoji } from '@/lib/spoonacular'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10)

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid recipe ID' }, { status: 400 })
  }

  try {
    const recipe = await getRecipeDetails(id)

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Transform to our format
    const formattedRecipe = {
      id: recipe.id,
      name: recipe.title,
      image: recipe.image,
      emoji: getRecipeEmoji({ title: recipe.title, dishTypes: recipe.dishTypes }),
      servings: recipe.servings,
      readyInMinutes: recipe.readyInMinutes,
      healthScore: recipe.healthScore,
      spoonacularScore: recipe.spoonacularScore,
      summary: recipe.summary.replace(/<[^>]*>/g, ''), // Strip HTML
      instructions: recipe.instructions?.replace(/<[^>]*>/g, '') || '',
      steps: recipe.analyzedInstructions[0]?.steps.map(step => ({
        number: step.number,
        instruction: step.step,
        ingredients: step.ingredients.map(i => i.name),
        equipment: step.equipment.map(e => e.name),
      })) || [],
      ingredients: recipe.extendedIngredients.map(i => ({
        id: i.id,
        name: i.name,
        amount: i.amount,
        unit: i.unit,
        original: i.original,
      })),
      dishTypes: recipe.dishTypes,
      diets: recipe.diets,
      cuisines: recipe.cuisines,
      vegetarian: recipe.vegetarian,
      vegan: recipe.vegan,
      glutenFree: recipe.glutenFree,
      dairyFree: recipe.dairyFree,
      sourceUrl: recipe.sourceUrl,
      sourceName: recipe.sourceName,
    }

    return NextResponse.json(formattedRecipe)
  } catch (error) {
    console.error('Recipe details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recipe details' },
      { status: 500 }
    )
  }
}
