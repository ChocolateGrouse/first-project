'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Upload, Refrigerator, Check, X, Sparkles, AlertCircle } from 'lucide-react'
import { addMultipleItems, guessItemDetails } from '@/lib/inventory-store'

interface DetectedItem {
  name: string
  quantity: string
  confidence: number
  selected: boolean
}

export default function FridgeScanPage() {
  const router = useRouter()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const imageData = reader.result as string
        setUploadedImage(imageData)
        analyzeImage(imageData)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async (imageData: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, type: 'fridge' }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image')
      }

      if (data.items && Array.isArray(data.items)) {
        setDetectedItems(
          data.items.map((item: { name: string; quantity: string; confidence?: number }) => ({
            name: item.name,
            quantity: item.quantity || '1',
            confidence: item.confidence || 80,
            selected: true,
          }))
        )
      } else {
        setDetectedItems([])
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze image')
    } finally {
      setIsProcessing(false)
    }
  }

  const removeItem = (index: number) => {
    setDetectedItems(detectedItems.filter((_, i) => i !== index))
  }

  const toggleItem = (index: number) => {
    setDetectedItems(detectedItems.map((item, i) =>
      i === index ? { ...item, selected: !item.selected } : item
    ))
  }

  const addAllToInventory = () => {
    setIsAdding(true)

    const selectedItems = detectedItems.filter(item => item.selected)

    const itemsToAdd = selectedItems.map(item => {
      const { category, icon } = guessItemDetails(item.name)
      return {
        name: item.name,
        category,
        quantity: 1,
        unit: item.quantity,
        expiry: '7 days', // Default expiry
        icon,
        status: 'fresh' as const,
      }
    })

    addMultipleItems(itemsToAdd)

    // Show success and redirect
    setTimeout(() => {
      router.push('/inventory')
    }, 500)
  }

  const selectedCount = detectedItems.filter(item => item.selected).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/inventory"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Refrigerator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scan Your Fridge</h1>
            <p className="text-gray-500">Take a photo and we&apos;ll detect what&apos;s inside</p>
          </div>
        </div>
      </div>

      {!uploadedImage ? (
        /* Upload Area */
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Refrigerator className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Snap a photo of your fridge</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Open your fridge, take a clear photo, and our AI will identify the items inside
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 cursor-pointer shadow-lg shadow-blue-200">
                <Camera className="w-5 h-5" />
                Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <label className="flex items-center gap-2 px-6 py-3 border border-gray-200 text-gray-600 rounded-lg font-medium hover:bg-gray-50 cursor-pointer">
                <Upload className="w-5 h-5" />
                Upload Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Tips */}
            <div className="mt-8 text-left bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">Tips for best results:</p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Make sure the fridge is well-lit</li>
                <li>• Include all shelves if possible</li>
                <li>• Move items forward so labels are visible</li>
                <li>• Take multiple photos for a full fridge</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Processing / Results */
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Refrigerator className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">Fridge Photo</span>
              </div>
              <button
                onClick={() => {
                  setUploadedImage(null)
                  setDetectedItems([])
                }}
                className="text-sm text-red-500 hover:text-red-600 font-medium"
              >
                Take new photo
              </button>
            </div>
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={uploadedImage}
                alt="Fridge contents"
                className="w-full max-h-[300px] object-cover"
              />
            </div>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-blue-100 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <Sparkles className="w-6 h-6 text-blue-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h3 className="font-semibold text-blue-900">AI is scanning your fridge...</h3>
              <p className="text-blue-600 text-sm mt-1">Identifying items and estimating quantities</p>
            </div>
          )}

          {/* Error State */}
          {error && !isProcessing && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-900">Analysis Failed</h3>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                  <button
                    onClick={() => uploadedImage && analyzeImage(uploadedImage)}
                    className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Detected Items */}
          {!isProcessing && detectedItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-50 to-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Items Detected</h3>
                      <p className="text-sm text-gray-500">{selectedCount} of {detectedItems.length} items selected</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-50">
                {detectedItems.map((item, index) => (
                  <div key={index} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleItem(index)}
                        className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                          item.selected
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300 hover:border-green-400'
                        }`}
                      >
                        {item.selected && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <div>
                        <p className={`font-medium ${item.selected ? 'text-gray-900' : 'text-gray-400'}`}>
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        item.confidence >= 85 ? 'bg-green-100 text-green-700' :
                        item.confidence >= 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.confidence}% sure
                      </span>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-3">
                <button
                  onClick={addAllToInventory}
                  disabled={selectedCount === 0 || isAdding}
                  className={`w-full py-3 rounded-lg font-medium shadow-lg transition-all ${
                    selectedCount === 0 || isAdding
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-blue-200'
                  }`}
                >
                  {isAdding ? 'Adding...' : `Add ${selectedCount} Items to Inventory`}
                </button>
                <p className="text-xs text-center text-gray-500">
                  You can edit quantities and expiry dates after adding
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          🤖
        </div>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">Powered by AI</h4>
          <p className="text-gray-500 text-sm mt-0.5">
            Our AI analyzes your photo to detect items. Results may vary - you can always edit or remove items before adding them.
          </p>
        </div>
      </div>
    </div>
  )
}
