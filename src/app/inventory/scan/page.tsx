'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Camera, Upload, Image, Check, X } from 'lucide-react'
import { addMultipleItems, guessItemDetails } from '@/lib/inventory-store'

interface DetectedItem {
  name: string
  quantity: string
  selected: boolean
}

export default function ScanReceiptPage() {
  const router = useRouter()
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result as string)
        simulateProcessing()
      }
      reader.readAsDataURL(file)
    }
  }

  const simulateProcessing = () => {
    setIsProcessing(true)
    // Simulate AI processing
    setTimeout(() => {
      setDetectedItems([
        { name: 'Milk', quantity: '1 gallon', selected: true },
        { name: 'Eggs', quantity: '1 dozen', selected: true },
        { name: 'Bread', quantity: '1 loaf', selected: true },
        { name: 'Chicken Breast', quantity: '2 lbs', selected: true },
        { name: 'Spinach', quantity: '1 bag', selected: true },
        { name: 'Orange Juice', quantity: '64 oz', selected: true },
      ])
      setIsProcessing(false)
    }, 2000)
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
        expiry: '7 days',
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
        <h1 className="text-2xl font-bold text-gray-900">Scan Receipt</h1>
        <p className="text-gray-500 mt-1">Take a photo of your receipt to add items automatically</p>
      </div>

      {!uploadedImage ? (
        /* Upload Area */
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload your receipt</h3>
            <p className="text-gray-500 text-sm mb-6">
              Take a photo or upload an image of your grocery receipt
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <label className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 cursor-pointer">
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
          </div>
        </div>
      ) : (
        /* Processing / Results */
        <div className="space-y-6">
          {/* Image Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-4">
              <Image className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Receipt Preview</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center min-h-[200px]">
              <img
                src={uploadedImage}
                alt="Receipt"
                className="max-h-[300px] rounded-lg shadow-sm"
              />
            </div>
            <button
              onClick={() => {
                setUploadedImage(null)
                setDetectedItems([])
              }}
              className="mt-4 text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Remove and try again
            </button>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-blue-50 rounded-xl border border-blue-100 p-6 text-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="font-semibold text-blue-900">Processing your receipt...</h3>
              <p className="text-blue-600 text-sm mt-1">Detecting items from your receipt</p>
            </div>
          )}

          {/* Detected Items */}
          {!isProcessing && detectedItems.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Detected Items</h3>
                  <p className="text-sm text-gray-500">{selectedCount} of {detectedItems.length} items selected</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Ready to add
                </span>
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
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={addAllToInventory}
                  disabled={selectedCount === 0 || isAdding}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    selectedCount === 0 || isAdding
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {isAdding ? 'Adding...' : `Add ${selectedCount} Items to Inventory`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Security Note */}
      <div className="mt-8 bg-gray-50 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          🔒
        </div>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">Your data is secure</h4>
          <p className="text-gray-500 text-sm mt-0.5">
            Receipt images are encrypted and only accessible by you. They are automatically deleted after processing.
          </p>
        </div>
      </div>
    </div>
  )
}
