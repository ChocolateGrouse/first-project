'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Clock, Users, Star, Heart, ShoppingCart,
  Check, X, Play, Plus, ChevronRight, Loader2
} from 'lucide-react'
import {
  saveRecipe,
  unsaveRecipe,
  isRecipeSaved,
  addShoppingItem,
  getShoppingItems,
  addCustomVideo,
  getCustomVideos,
  type CustomVideo
} from '@/lib/inventory-store'
import { VideoModal } from '@/components/ui/VideoModal'

interface YouTubeVideo {
  id: string
  title: string
  thumbnail: string
  duration: string
  channelTitle: string
}

// Mock recipe detail
const recipe = {
  id: 2,
  name: 'Chicken Stir Fry',
  image: '🥘',
  description: 'A quick and healthy stir fry loaded with tender chicken and crisp vegetables in a savory sauce.',
  time: '25 min',
  servings: 4,
  difficulty: 'Medium',
  rating: 4.6,
  reviews: 128,
  calories: 380,
  protein: '32g',
  carbs: '28g',
  fat: '12g',
  matchedIngredients: [
    { name: 'Chicken breast', amount: '1 lb', have: true },
    { name: 'Rice', amount: '2 cups', have: true },
    { name: 'Onion', amount: '1 medium', have: true },
    { name: 'Garlic', amount: '3 cloves', have: true },
    { name: 'Soy sauce', amount: '3 tbsp', have: true },
    { name: 'Bell peppers', amount: '2 medium', have: true },
  ],
  missingIngredients: [
    { name: 'Sesame oil', amount: '2 tbsp', have: false },
    { name: 'Fresh ginger', amount: '1 inch', have: false },
  ],
  instructions: [
    'Cut chicken breast into bite-sized pieces and season with salt and pepper.',
    'Cook rice according to package directions and set aside.',
    'Heat oil in a large wok or skillet over high heat.',
    'Add chicken pieces and cook until golden brown, about 5-6 minutes. Remove and set aside.',
    'Add more oil if needed, then add garlic and ginger. Cook for 30 seconds.',
    'Add vegetables and stir fry for 3-4 minutes until crisp-tender.',
    'Return chicken to the wok and add soy sauce.',
    'Toss everything together and cook for another 2 minutes.',
    'Serve hot over rice and garnish with sesame seeds.',
  ],
}

export default function RecipeDetailPage() {
  const [isSaved, setIsSaved] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [addedToList, setAddedToList] = useState<string[]>([])

  // Video state
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([])
  const [customVideos, setCustomVideos] = useState<CustomVideo[]>([])
  const [loadingVideos, setLoadingVideos] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)

  // Video modal state
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null)

  // Add custom video modal
  const [showAddVideoModal, setShowAddVideoModal] = useState(false)
  const [customVideoUrl, setCustomVideoUrl] = useState('')
  const [customVideoTitle, setCustomVideoTitle] = useState('')

  // Load saved state and videos on mount
  useEffect(() => {
    setMounted(true)
    setIsSaved(isRecipeSaved(recipe.id))

    // Check which ingredients are already in shopping list
    const shoppingItems = getShoppingItems()
    const inList = recipe.missingIngredients
      .filter(ing => shoppingItems.some(item => item.name.toLowerCase() === ing.name.toLowerCase()))
      .map(ing => ing.name)
    setAddedToList(inList)

    // Load custom videos
    setCustomVideos(getCustomVideos(recipe.id))

    // Fetch YouTube videos
    fetchYouTubeVideos()
  }, [])

  const fetchYouTubeVideos = async () => {
    setLoadingVideos(true)
    setVideoError(null)

    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(recipe.name)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load videos')
      }

      setYoutubeVideos(data.videos || [])
    } catch (err) {
      console.error('Video fetch error:', err)
      setVideoError(err instanceof Error ? err.message : 'Failed to load videos')
    } finally {
      setLoadingVideos(false)
    }
  }

  const handleToggleSave = () => {
    if (isSaved) {
      unsaveRecipe(recipe.id)
    } else {
      saveRecipe(recipe.id)
    }
    setIsSaved(!isSaved)
  }

  const handleAddIngredientToList = (ingredientName: string, amount: string) => {
    if (!addedToList.includes(ingredientName)) {
      addShoppingItem({
        name: ingredientName,
        quantity: amount,
        checked: false,
        category: 'Groceries',
        fromRecipe: recipe.name,
      })
      setAddedToList([...addedToList, ingredientName])
    }
  }

  const handleAddAllMissingToList = () => {
    recipe.missingIngredients.forEach(ing => {
      if (!addedToList.includes(ing.name)) {
        addShoppingItem({
          name: ing.name,
          quantity: ing.amount,
          checked: false,
          category: 'Groceries',
          fromRecipe: recipe.name,
        })
      }
    })
    setAddedToList(recipe.missingIngredients.map(ing => ing.name))
  }

  const handlePlayVideo = (videoId: string, title: string) => {
    setSelectedVideo({ id: videoId, title })
  }

  const handleAddCustomVideo = () => {
    if (!customVideoUrl || !customVideoTitle) return

    // Extract YouTube video ID if it's a YouTube URL
    let videoId = customVideoUrl
    const youtubeMatch = customVideoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (youtubeMatch) {
      videoId = youtubeMatch[1]
    }

    const newVideo = addCustomVideo({
      recipeId: recipe.id,
      url: videoId,
      title: customVideoTitle,
      platform: youtubeMatch ? 'youtube' : 'custom',
    })

    setCustomVideos([...customVideos, newVideo])
    setShowAddVideoModal(false)
    setCustomVideoUrl('')
    setCustomVideoTitle('')
  }

  const totalIngredients = recipe.matchedIngredients.length + recipe.missingIngredients.length
  const matchPercentage = Math.round((recipe.matchedIngredients.length / totalIngredients) * 100)
  const allMissingAdded = recipe.missingIngredients.every(ing => addedToList.includes(ing.name))

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        href="/recipes"
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Recipes
      </Link>

      {/* Hero Section */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 h-48 sm:h-64 flex items-center justify-center">
          <span className="text-8xl sm:text-9xl">{recipe.image}</span>
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{recipe.name}</h1>
              <p className="text-gray-500 mt-2">{recipe.description}</p>
            </div>
            <button
              onClick={handleToggleSave}
              className={`p-3 rounded-full transition-colors ${
                isSaved ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart className="w-6 h-6" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>{recipe.time}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5 text-gray-400" />
              <span>{recipe.servings} servings</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-5 h-5" fill="currentColor" />
              <span className="font-medium">{recipe.rating}</span>
              <span className="text-gray-400">({recipe.reviews} reviews)</span>
            </div>
          </div>

          {/* Match Progress */}
          <div className="mt-6 p-4 bg-green-50 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-green-900">Ingredient Match</span>
              <span className="text-green-700 font-bold">{matchPercentage}%</span>
            </div>
            <div className="h-2 bg-green-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${matchPercentage}%` }}
              />
            </div>
            <p className="text-sm text-green-700 mt-2">
              You have {recipe.matchedIngredients.length} of {totalIngredients} ingredients
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ingredients & Instructions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ingredients */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Ingredients</h2>
            </div>

            {/* Ingredients You Have */}
            <div className="p-4">
              <p className="text-sm font-medium text-green-600 mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Ingredients you have
              </p>
              <div className="space-y-2">
                {recipe.matchedIngredients.map((ing, index) => (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                    <span className="text-gray-900">{ing.name}</span>
                    <span className="text-gray-500 text-sm">{ing.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Ingredients */}
            {recipe.missingIngredients.length > 0 && (
              <div className="p-4 border-t border-gray-100">
                <p className="text-sm font-medium text-red-600 mb-3 flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Missing ingredients
                </p>
                <div className="space-y-2">
                  {recipe.missingIngredients.map((ing, index) => {
                    const isAdded = addedToList.includes(ing.name)
                    return (
                      <div key={index} className={`flex items-center justify-between py-2 px-3 rounded-lg ${isAdded ? 'bg-green-50' : 'bg-red-50'}`}>
                        <span className={isAdded ? 'text-green-700' : 'text-gray-900'}>{ing.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm">{ing.amount}</span>
                          {isAdded ? (
                            <span className="text-green-600">
                              <Check className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddIngredientToList(ing.name, ing.amount)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={handleAddAllMissingToList}
                  disabled={allMissingAdded}
                  className={`w-full mt-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${
                    allMissingAdded
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {allMissingAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      All Added to Shopping List
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      Add Missing to Shopping List
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Instructions</h2>
            </div>
            <div className="p-4 space-y-4">
              {recipe.instructions.map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-700 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-700 pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Videos & Nutrition */}
        <div className="space-y-6">
          {/* Cooking Videos */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Cooking Videos</h2>
              <Play className="w-5 h-5 text-red-500" />
            </div>
            <div className="p-4 space-y-3">
              {loadingVideos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : videoError ? (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">{videoError}</p>
                  <button
                    onClick={fetchYouTubeVideos}
                    className="mt-2 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    Try again
                  </button>
                </div>
              ) : youtubeVideos.length === 0 && customVideos.length === 0 ? (
                <p className="text-center text-sm text-gray-500 py-4">No videos found</p>
              ) : (
                <>
                  {/* YouTube Videos */}
                  {youtubeVideos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handlePlayVideo(video.id, video.title)}
                      className="w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Play className="w-5 h-5 text-red-500" fill="currentColor" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.duration}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </button>
                  ))}

                  {/* Custom Videos */}
                  {customVideos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => handlePlayVideo(video.url, video.title)}
                      className="w-full p-3 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Play className="w-5 h-5 text-blue-500" fill="currentColor" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{video.title}</p>
                          <p className="text-xs text-gray-500">Custom video</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                    </button>
                  ))}
                </>
              )}
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => setShowAddVideoModal(true)}
                className="w-full py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                + Add Custom Video
              </button>
            </div>
          </div>

          {/* Nutrition Info */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Nutrition</h2>
              <p className="text-sm text-gray-500">Per serving</p>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{recipe.calories}</p>
                <p className="text-sm text-gray-500">Calories</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{recipe.protein}</p>
                <p className="text-sm text-gray-500">Protein</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{recipe.carbs}</p>
                <p className="text-sm text-gray-500">Carbs</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{recipe.fat}</p>
                <p className="text-sm text-gray-500">Fat</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoModal
          videoId={selectedVideo.id}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      {/* Add Custom Video Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddVideoModal(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Video</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video Title</label>
                <input
                  type="text"
                  value={customVideoTitle}
                  onChange={(e) => setCustomVideoTitle(e.target.value)}
                  placeholder="My favorite stir fry tutorial"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">YouTube URL or Video ID</label>
                <input
                  type="text"
                  value={customVideoUrl}
                  onChange={(e) => setCustomVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddVideoModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomVideo}
                disabled={!customVideoUrl || !customVideoTitle}
                className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
              >
                Add Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
