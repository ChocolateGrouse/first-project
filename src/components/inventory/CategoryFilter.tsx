'use client'

interface Category {
  id: string
  name: string
  icon: string
}

interface CategoryFilterProps {
  categories: Category[]
  selected: string
  onSelect: (id: string) => void
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selected === category.id
              ? 'bg-green-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600'
          }`}
        >
          <span>{category.icon}</span>
          <span className="font-medium text-sm">{category.name}</span>
        </button>
      ))}
    </div>
  )
}
