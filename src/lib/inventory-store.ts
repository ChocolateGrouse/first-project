// Simple localStorage-based store for inventory items
// This will be replaced with a real database later

export interface InventoryItem {
  id: number
  name: string
  category: string
  quantity: number
  unit: string
  expiry: string  // Now stores ISO date string (e.g., "2024-01-20")
  expiryDate?: string  // ISO date string for actual expiry date
  icon: string
  status: 'fresh' | 'good' | 'expiring' | 'expired'
  addedAt: string
}

// Helper to calculate days until expiry
export function getDaysUntilExpiry(expiryDate: string): number {
  const expiry = new Date(expiryDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  expiry.setHours(0, 0, 0, 0)
  const diffTime = expiry.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Helper to get status based on expiry date
export function getExpiryStatus(expiryDate: string): 'fresh' | 'good' | 'expiring' | 'expired' {
  const days = getDaysUntilExpiry(expiryDate)
  if (days < 0) return 'expired'
  if (days <= 2) return 'expiring'
  if (days <= 5) return 'good'
  return 'fresh'
}

// Helper to format expiry display
export function formatExpiryDisplay(expiryDate: string): string {
  const days = getDaysUntilExpiry(expiryDate)
  if (days < 0) return `Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
  if (days === 0) return 'Expires today'
  if (days === 1) return 'Expires tomorrow'
  return `${days} days left`
}

const STORAGE_KEY = 'smart-kitchen-inventory'

export function getInventoryItems(): InventoryItem[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveInventoryItems(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  // Dispatch event so other components can react
  window.dispatchEvent(new Event('inventory-updated'))
}

export function addInventoryItem(item: Omit<InventoryItem, 'id' | 'addedAt'>): InventoryItem {
  const items = getInventoryItems()
  const newItem: InventoryItem = {
    ...item,
    id: Date.now(),
    addedAt: new Date().toISOString(),
  }
  items.push(newItem)
  saveInventoryItems(items)
  return newItem
}

export function addMultipleItems(newItems: Array<Omit<InventoryItem, 'id' | 'addedAt'>>): InventoryItem[] {
  const items = getInventoryItems()
  const addedItems: InventoryItem[] = newItems.map((item, index) => ({
    ...item,
    id: Date.now() + index,
    addedAt: new Date().toISOString(),
  }))
  items.push(...addedItems)
  saveInventoryItems(items)
  return addedItems
}

export function updateInventoryItem(id: number, updates: Partial<InventoryItem>): InventoryItem | null {
  const items = getInventoryItems()
  const index = items.findIndex(item => item.id === id)
  if (index === -1) return null

  items[index] = { ...items[index], ...updates }
  saveInventoryItems(items)
  return items[index]
}

export function deleteInventoryItem(id: number): void {
  const items = getInventoryItems()
  const filtered = items.filter(item => item.id !== id)
  saveInventoryItems(filtered)
}

export function clearInventory(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event('inventory-updated'))
}

// Shopping list storage
const SHOPPING_KEY = 'smart-kitchen-shopping'

export interface ShoppingItem {
  id: number
  name: string
  quantity: string
  checked: boolean
  category: string
  fromRecipe?: string
}

export function getShoppingItems(): ShoppingItem[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(SHOPPING_KEY)
  return data ? JSON.parse(data) : []
}

export function saveShoppingItems(items: ShoppingItem[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(SHOPPING_KEY, JSON.stringify(items))
  window.dispatchEvent(new Event('shopping-updated'))
}

export function addShoppingItem(item: Omit<ShoppingItem, 'id'>): ShoppingItem {
  const items = getShoppingItems()
  const newItem: ShoppingItem = { ...item, id: Date.now() }
  items.push(newItem)
  saveShoppingItems(items)
  return newItem
}

export function updateShoppingItem(id: number, updates: Partial<ShoppingItem>): void {
  const items = getShoppingItems()
  const index = items.findIndex(item => item.id === id)
  if (index !== -1) {
    items[index] = { ...items[index], ...updates }
    saveShoppingItems(items)
  }
}

export function deleteShoppingItem(id: number): void {
  const items = getShoppingItems()
  saveShoppingItems(items.filter(item => item.id !== id))
}

export function clearCheckedShoppingItems(): void {
  const items = getShoppingItems()
  saveShoppingItems(items.filter(item => !item.checked))
}

// Saved recipes storage
const SAVED_RECIPES_KEY = 'smart-kitchen-saved-recipes'

export function getSavedRecipes(): number[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(SAVED_RECIPES_KEY)
  return data ? JSON.parse(data) : []
}

export function saveRecipe(recipeId: number): void {
  const saved = getSavedRecipes()
  if (!saved.includes(recipeId)) {
    saved.push(recipeId)
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(saved))
  }
}

export function unsaveRecipe(recipeId: number): void {
  const saved = getSavedRecipes()
  localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(saved.filter(id => id !== recipeId)))
}

export function isRecipeSaved(recipeId: number): boolean {
  return getSavedRecipes().includes(recipeId)
}

// Helper to guess category and icon from item name
export function guessItemDetails(name: string): { category: string; icon: string } {
  const lowerName = name.toLowerCase()

  if (lowerName.includes('milk') || lowerName.includes('cream')) {
    return { category: 'dairy', icon: '🥛' }
  }
  if (lowerName.includes('cheese')) {
    return { category: 'dairy', icon: '🧀' }
  }
  if (lowerName.includes('yogurt')) {
    return { category: 'dairy', icon: '🥛' }
  }
  if (lowerName.includes('butter')) {
    return { category: 'dairy', icon: '🧈' }
  }
  if (lowerName.includes('egg')) {
    return { category: 'dairy', icon: '🥚' }
  }
  if (lowerName.includes('chicken')) {
    return { category: 'meat', icon: '🍗' }
  }
  if (lowerName.includes('beef') || lowerName.includes('steak')) {
    return { category: 'meat', icon: '🥩' }
  }
  if (lowerName.includes('pork') || lowerName.includes('bacon')) {
    return { category: 'meat', icon: '🥓' }
  }
  if (lowerName.includes('fish') || lowerName.includes('salmon') || lowerName.includes('shrimp')) {
    return { category: 'meat', icon: '🐟' }
  }
  if (lowerName.includes('lettuce') || lowerName.includes('spinach') || lowerName.includes('salad') || lowerName.includes('kale')) {
    return { category: 'produce', icon: '🥬' }
  }
  if (lowerName.includes('tomato')) {
    return { category: 'produce', icon: '🍅' }
  }
  if (lowerName.includes('onion')) {
    return { category: 'produce', icon: '🧅' }
  }
  if (lowerName.includes('garlic')) {
    return { category: 'produce', icon: '🧄' }
  }
  if (lowerName.includes('carrot')) {
    return { category: 'produce', icon: '🥕' }
  }
  if (lowerName.includes('apple')) {
    return { category: 'produce', icon: '🍎' }
  }
  if (lowerName.includes('banana')) {
    return { category: 'produce', icon: '🍌' }
  }
  if (lowerName.includes('orange')) {
    return { category: 'produce', icon: '🍊' }
  }
  if (lowerName.includes('juice')) {
    return { category: 'beverages', icon: '🧃' }
  }
  if (lowerName.includes('bread') || lowerName.includes('bagel') || lowerName.includes('muffin')) {
    return { category: 'bakery', icon: '🍞' }
  }
  if (lowerName.includes('rice')) {
    return { category: 'pantry', icon: '🍚' }
  }
  if (lowerName.includes('pasta') || lowerName.includes('noodle')) {
    return { category: 'pantry', icon: '🍝' }
  }
  if (lowerName.includes('frozen') || lowerName.includes('ice cream')) {
    return { category: 'frozen', icon: '🧊' }
  }

  return { category: 'pantry', icon: '📦' }
}

// User settings storage
const USER_SETTINGS_KEY = 'smart-kitchen-settings'

export interface UserSettings {
  notifications: boolean
  emailAlerts: boolean
  darkMode: boolean
  language: string
}

export function getUserSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return { notifications: true, emailAlerts: true, darkMode: false, language: 'en' }
  }
  const data = localStorage.getItem(USER_SETTINGS_KEY)
  return data ? JSON.parse(data) : { notifications: true, emailAlerts: true, darkMode: false, language: 'en' }
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_SETTINGS_KEY, JSON.stringify(settings))
  window.dispatchEvent(new Event('settings-updated'))
}

// Custom videos storage
const CUSTOM_VIDEOS_KEY = 'smart-kitchen-custom-videos'

export interface CustomVideo {
  id: number
  recipeId: number
  url: string
  title: string
  platform: 'youtube' | 'custom'
  addedAt: string
}

export function getCustomVideos(recipeId?: number): CustomVideo[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(CUSTOM_VIDEOS_KEY)
  const videos: CustomVideo[] = data ? JSON.parse(data) : []
  return recipeId ? videos.filter(v => v.recipeId === recipeId) : videos
}

export function addCustomVideo(video: Omit<CustomVideo, 'id' | 'addedAt'>): CustomVideo {
  const videos = getCustomVideos()
  const newVideo: CustomVideo = {
    ...video,
    id: Date.now(),
    addedAt: new Date().toISOString(),
  }
  videos.push(newVideo)
  localStorage.setItem(CUSTOM_VIDEOS_KEY, JSON.stringify(videos))
  return newVideo
}

export function deleteCustomVideo(id: number): void {
  const videos = getCustomVideos()
  localStorage.setItem(CUSTOM_VIDEOS_KEY, JSON.stringify(videos.filter(v => v.id !== id)))
}
