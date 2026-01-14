// Spoonacular API client for recipe search

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY
const BASE_URL = 'https://api.spoonacular.com'

export interface SpoonacularRecipe {
  id: number
  title: string
  image: string
  imageType: string
  usedIngredientCount: number
  missedIngredientCount: number
  missedIngredients: Array<{
    id: number
    name: string
    amount: number
    unit: string
    original: string
  }>
  usedIngredients: Array<{
    id: number
    name: string
    amount: number
    unit: string
    original: string
  }>
  unusedIngredients: Array<{
    id: number
    name: string
    amount: number
    unit: string
    original: string
  }>
  likes: number
}

export interface RecipeDetails {
  id: number
  title: string
  image: string
  servings: number
  readyInMinutes: number
  sourceName: string
  sourceUrl: string
  spoonacularScore: number
  healthScore: number
  summary: string
  instructions: string
  analyzedInstructions: Array<{
    name: string
    steps: Array<{
      number: number
      step: string
      ingredients: Array<{ id: number; name: string; image: string }>
      equipment: Array<{ id: number; name: string; image: string }>
    }>
  }>
  extendedIngredients: Array<{
    id: number
    name: string
    original: string
    amount: number
    unit: string
    image: string
  }>
  dishTypes: string[]
  diets: string[]
  cuisines: string[]
  vegetarian: boolean
  vegan: boolean
  glutenFree: boolean
  dairyFree: boolean
}

// Search recipes by ingredients
export async function searchRecipesByIngredients(
  ingredients: string[],
  options: { number?: number; ranking?: 1 | 2; ignorePantry?: boolean } = {}
): Promise<SpoonacularRecipe[]> {
  if (!SPOONACULAR_API_KEY) {
    console.warn('SPOONACULAR_API_KEY not set, returning empty results')
    return []
  }

  const { number = 12, ranking = 1, ignorePantry = true } = options

  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    ingredients: ingredients.join(','),
    number: String(number),
    ranking: String(ranking),
    ignorePantry: String(ignorePantry),
  })

  try {
    const response = await fetch(`${BASE_URL}/recipes/findByIngredients?${params}`)

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching recipes by ingredients:', error)
    return []
  }
}

// Get recipe details by ID
export async function getRecipeDetails(id: number): Promise<RecipeDetails | null> {
  if (!SPOONACULAR_API_KEY) {
    console.warn('SPOONACULAR_API_KEY not set')
    return null
  }

  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
  })

  try {
    const response = await fetch(`${BASE_URL}/recipes/${id}/information?${params}`)

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching recipe details:', error)
    return null
  }
}

// Search recipes by query
export async function searchRecipes(
  query: string,
  options: { number?: number; offset?: number; diet?: string; cuisine?: string } = {}
): Promise<{ results: SpoonacularRecipe[]; totalResults: number }> {
  if (!SPOONACULAR_API_KEY) {
    console.warn('SPOONACULAR_API_KEY not set')
    return { results: [], totalResults: 0 }
  }

  const { number = 12, offset = 0, diet, cuisine } = options

  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    query,
    number: String(number),
    offset: String(offset),
    addRecipeInformation: 'true',
    fillIngredients: 'true',
  })

  if (diet) params.append('diet', diet)
  if (cuisine) params.append('cuisine', cuisine)

  try {
    const response = await fetch(`${BASE_URL}/recipes/complexSearch?${params}`)

    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('Error searching recipes:', error)
    return { results: [], totalResults: 0 }
  }
}

// Helper to get emoji for recipe based on dish type or name
export function getRecipeEmoji(recipe: { title: string; dishTypes?: string[] }): string {
  const title = recipe.title.toLowerCase()
  const dishTypes = recipe.dishTypes?.map(d => d.toLowerCase()) || []

  if (title.includes('chicken') || dishTypes.includes('main course')) {
    if (title.includes('soup')) return '🍲'
    if (title.includes('salad')) return '🥗'
    return '🍗'
  }
  if (title.includes('beef') || title.includes('steak')) return '🥩'
  if (title.includes('fish') || title.includes('salmon') || title.includes('seafood')) return '🐟'
  if (title.includes('pasta') || title.includes('spaghetti')) return '🍝'
  if (title.includes('pizza')) return '🍕'
  if (title.includes('salad')) return '🥗'
  if (title.includes('soup') || title.includes('stew')) return '🍲'
  if (title.includes('rice') || title.includes('risotto')) return '🍚'
  if (title.includes('egg') || title.includes('omelet') || title.includes('scramble')) return '🍳'
  if (title.includes('sandwich') || title.includes('burger')) return '🍔'
  if (title.includes('taco') || title.includes('mexican')) return '🌮'
  if (title.includes('cake') || title.includes('dessert') || dishTypes.includes('dessert')) return '🍰'
  if (title.includes('cookie') || title.includes('brownie')) return '🍪'
  if (title.includes('smoothie') || title.includes('shake')) return '🥤'
  if (dishTypes.includes('breakfast')) return '🍳'
  if (dishTypes.includes('appetizer') || dishTypes.includes('snack')) return '🥪'
  if (dishTypes.includes('side dish')) return '🥗'

  return '🍽️'
}
