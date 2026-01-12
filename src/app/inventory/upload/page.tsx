'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, Check, X, AlertCircle } from 'lucide-react'
import { addMultipleItems, guessItemDetails } from '@/lib/inventory-store'

export default function UploadCSVPage() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [processedItems, setProcessedItems] = useState<Array<{
    name: string
    category: string
    isFood: boolean
    amount: string
  }>>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      simulateProcessing()
    }
  }

  const simulateProcessing = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setProcessedItems([
        { name: 'Trader Joe\'s', category: 'Grocery', isFood: true, amount: '$67.42' },
        { name: 'Whole Foods', category: 'Grocery', isFood: true, amount: '$123.89' },
        { name: 'Netflix', category: 'Entertainment', isFood: false, amount: '$15.99' },
        { name: 'Safeway', category: 'Grocery', isFood: true, amount: '$45.23' },
        { name: 'Amazon', category: 'Shopping', isFood: false, amount: '$34.99' },
        { name: 'Costco', category: 'Grocery', isFood: true, amount: '$234.56' },
        { name: 'Uber Eats', category: 'Food Delivery', isFood: true, amount: '$28.50' },
      ])
      setIsProcessing(false)
    }, 2000)
  }

  const foodItems = processedItems.filter(item => item.isFood)
  const nonFoodItems = processedItems.filter(item => !item.isFood)

  const importFoodPurchases = () => {
    setIsImporting(true)

    // Map store names to typical items you might buy there
    const storeToItems: Record<string, string[]> = {
      "Trader Joe's": ['Organic Eggs', 'Almond Butter', 'Mixed Greens'],
      'Whole Foods': ['Free Range Chicken', 'Quinoa', 'Organic Milk'],
      'Safeway': ['Bread', 'Butter', 'Orange Juice'],
      'Costco': ['Ground Beef', 'Rice', 'Frozen Vegetables', 'Cheese'],
      'Uber Eats': ['Leftovers'],
    }

    const itemsToAdd = foodItems.flatMap(store => {
      const items = storeToItems[store.name] || ['Groceries']
      return items.map(itemName => {
        const { category, icon } = guessItemDetails(itemName)
        return {
          name: itemName,
          category,
          quantity: 1,
          unit: 'count',
          expiry: '7 days',
          icon,
          status: 'fresh' as const,
        }
      })
    })

    addMultipleItems(itemsToAdd)

    setTimeout(() => {
      router.push('/inventory')
    }, 500)
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/inventory"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import from Bank Statement</h1>
        <p className="text-gray-500 mt-1">Upload a CSV export to auto-detect food purchases</p>
      </div>

      {!uploadedFile ? (
        /* Upload Area */
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload your bank statement</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Export a CSV file from your bank or credit card (like Amex) and we&apos;ll automatically detect food purchases
            </p>

            <label className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 cursor-pointer">
              <FileText className="w-5 h-5" />
              Select CSV File
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <p className="text-xs text-gray-400 mt-4">
              Supported: Amex, Chase, Bank of America, and most standard CSV formats
            </p>
          </div>
        </div>
      ) : (
        /* Processing / Results */
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setUploadedFile(null)
                setProcessedItems([])
              }}
              className="text-sm text-red-500 hover:text-red-600 font-medium"
            >
              Remove
            </button>
          </div>

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-purple-50 rounded-xl border border-purple-100 p-6 text-center">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
              <h3 className="font-semibold text-purple-900">Analyzing your transactions...</h3>
              <p className="text-purple-600 text-sm mt-1">Detecting food vs non-food purchases</p>
            </div>
          )}

          {/* Results */}
          {!isProcessing && processedItems.length > 0 && (
            <>
              {/* Food Items */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Food Purchases Detected</h3>
                      <p className="text-sm text-gray-500">{foodItems.length} transactions identified</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {foodItems.map((item, index) => (
                    <div key={index} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🛒</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-Food Items (Skipped) */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Non-Food (Skipped)</h3>
                      <p className="text-sm text-gray-500">{nonFoodItems.length} transactions ignored</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {nonFoodItems.map((item, index) => (
                    <div key={index} className="px-6 py-3 flex items-center justify-between opacity-50">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">📦</span>
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={importFoodPurchases}
                disabled={isImporting}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isImporting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isImporting ? 'Importing...' : `Import ${foodItems.length} Food Purchases`}
              </button>
            </>
          )}
        </div>
      )}

      {/* Security Note */}
      <div className="mt-8 bg-gray-50 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          🔒
        </div>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">Your financial data is secure</h4>
          <p className="text-gray-500 text-sm mt-0.5">
            We only process transaction names and amounts locally. Your bank credentials are never stored or shared.
          </p>
        </div>
      </div>
    </div>
  )
}
