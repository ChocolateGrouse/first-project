import Link from 'next/link'
import { Plus, Camera, Upload, ChefHat, Refrigerator } from 'lucide-react'

const actions = [
  {
    name: 'Scan Fridge',
    description: 'Photo your fridge contents',
    href: '/inventory/fridge',
    icon: Refrigerator,
    color: 'bg-cyan-500',
  },
  {
    name: 'Scan Receipt',
    description: 'Take a photo of your receipt',
    href: '/inventory/scan',
    icon: Camera,
    color: 'bg-blue-500',
  },
  {
    name: 'Add Item',
    description: 'Manually add to inventory',
    href: '/inventory/add',
    icon: Plus,
    color: 'bg-green-500',
  },
  {
    name: 'Find Recipes',
    description: 'Based on your ingredients',
    href: '/recipes',
    icon: ChefHat,
    color: 'bg-orange-500',
  },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Link
          key={action.name}
          href={action.href}
          className="bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 hover:shadow-md card-hover"
        >
          <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
            <action.icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">{action.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{action.description}</p>
        </Link>
      ))}
    </div>
  )
}
