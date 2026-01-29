'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, Check, X, AlertCircle } from 'lucide-react'
import { addMultipleItems, guessItemDetails } from '@/lib/inventory-store'

interface ParsedItem {
  name: string
  quantity: string
  selected: boolean
}

export default function UploadCSVPage() {
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      setError(null)
      parseCSV(file)
    }
  }

  const parseCSV = async (file: File) => {
    setIsProcessing(true)

    try {
      const text = await file.text()
      const lines = text.split('\n').filter(line => line.trim())

      if (lines.length === 0) {
        setError('The CSV file appears to be empty')
        setParsedItems([])
        setIsProcessing(false)
        return
      }

      // Try to detect the format
      const firstLine = lines[0].toLowerCase()
      const hasHeader = firstLine.includes('item') || firstLine.includes('name') || firstLine.includes('product') || firstLine.includes('quantity')

      const dataLines = hasHeader ? lines.slice(1) : lines
      const items: ParsedItem[] = []

      for (const line of dataLines) {
        // Handle both comma and tab separated values
        const parts = line.includes('\t') ? line.split('\t') : line.split(',')

        if (parts.length >= 1) {
          const name = parts[0].trim().replace(/^["']|["']$/g, '') // Remove quotes
          const quantity = parts[1]?.trim().replace(/^["']|["']$/g, '') || '1'

          // Skip empty names or obviously non-food items
          if (name && name.length > 0 && !name.match(/^\d+$/)) {
            items.push({
              name,
              quantity,
              selected: true,
            })
          }
        }
      }

      if (items.length === 0) {
        setError('No items found in the CSV. Make sure your file has item names in the first column.')
      }

      setParsedItems(items)
    } catch (err) {
      console.error('CSV parsing error:', err)
      setError('Failed to parse the CSV file. Please check the file format.')
      setParsedItems([])
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleItem = (index: number) => {
    setParsedItems(parsedItems.map((item, i) =>
      i === index ? { ...item, selected: !item.selected } : item
    ))
  }

  const removeItem = (index: number) => {
    setParsedItems(parsedItems.filter((_, i) => i !== index))
  }

  const selectedItems = parsedItems.filter(item => item.selected)

  const importItems = () => {
    setIsImporting(true)

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
        <h1 className="text-2xl font-bold text-gray-900">Import Grocery List</h1>
        <p className="text-gray-500 mt-1">Upload a CSV file with your grocery items</p>
      </div>

      {!uploadedFile ? (
        /* Upload Area */
        <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Upload your grocery list</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Upload a CSV file with item names. We&apos;ll parse it and add items to your inventory.
            </p>

            <label className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 cursor-pointer">
              <FileText className="w-5 h-5" />
              Select CSV File
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Format Info */}
            <div className="mt-8 text-left bg-gray-50 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-sm font-medium text-gray-900 mb-2">Expected format:</p>
              <code className="text-xs text-gray-600 block bg-white p-2 rounded border">
                item name, quantity<br/>
                Milk, 1 gallon<br/>
                Eggs, 1 dozen<br/>
                Bread, 2 loaves
              </code>
            </div>
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
                setParsedItems([])
                setError(null)
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
              <h3 className="font-semibold text-purple-900">Parsing your file...</h3>
              <p className="text-purple-600 text-sm mt-1">Reading items from CSV</p>
            </div>
          )}

          {/* Error State */}
          {error && !isProcessing && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">{error}</p>
                  <p className="text-red-700 text-sm mt-1">
                    Try a different file or check the format.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Parsed Items */}
          {!isProcessing && parsedItems.length > 0 && (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Items Found</h3>
                      <p className="text-sm text-gray-500">{selectedItems.length} of {parsedItems.length} items selected</p>
                    </div>
                  </div>
                </div>
                <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
                  {parsedItems.map((item, index) => (
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
              </div>

              {/* Action Button */}
              <button
                onClick={importItems}
                disabled={selectedItems.length === 0 || isImporting}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  selectedItems.length === 0 || isImporting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                {isImporting ? 'Importing...' : `Add ${selectedItems.length} Items to Inventory`}
              </button>
            </>
          )}

          {/* Empty state after parsing */}
          {!isProcessing && !error && parsedItems.length === 0 && uploadedFile && (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-600">No items were found in the file.</p>
              <p className="text-gray-500 text-sm mt-1">Make sure your CSV has item names in the first column.</p>
            </div>
          )}
        </div>
      )}

      {/* Info Note */}
      <div className="mt-8 bg-gray-50 rounded-xl p-4 flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
          📝
        </div>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">Tip</h4>
          <p className="text-gray-500 text-sm mt-0.5">
            For best results, use a simple CSV with item names in the first column and optional quantities in the second.
          </p>
        </div>
      </div>
    </div>
  )
}
