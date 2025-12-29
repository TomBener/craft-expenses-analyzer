import type { CraftExpenseItem, Expense } from './types'
import { mapCraftItemToExpense } from './expenseMapping'

// Replace these with your actual Craft API values in production
const CRAFT_API_BASE = 'https://connect.craft.do/links/YOUR_LINK_ID/api/v1'
const COLLECTION_ID = 'YOUR-COLLECTION-ID-HERE' // Receipts collection ID

interface CraftApiResponse {
  items: CraftExpenseItem[]
}

/**
 * Fetch expenses from Craft API
 */
export async function fetchExpensesFromCraft(): Promise<Expense[]> {
  const token = process.env.CRAFT_API_TOKEN

  if (!token) {
    throw new Error('CRAFT_API_TOKEN environment variable is not set')
  }

  const response = await fetch(
    `${CRAFT_API_BASE}/collections/${COLLECTION_ID}/items`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // Revalidate every 5 minutes
      next: { revalidate: 300 },
    }
  )

  if (!response.ok) {
    throw new Error(`Craft API error: ${response.status} ${response.statusText}`)
  }

  const data: CraftApiResponse = await response.json()
  
  return data.items.map(transformCraftExpense)
}

/**
 * Transform Craft expense item to our Expense type
 */
function transformCraftExpense(item: CraftExpenseItem): Expense {
  return mapCraftItemToExpense({
    id: item.id,
    title: item.title,
    merchant: item.merchant,
    properties: item.properties,
  })
}

/**
 * Get category color based on emoji/name
 */
export function getCategoryColor(category: string): string {
  const categoryLower = category.toLowerCase()
  
  if (categoryLower.includes('groceries') || categoryLower.includes('🛒')) {
    return '#22c55e' // green
  }
  if (categoryLower.includes('shopping') || categoryLower.includes('🛍️')) {
    return '#f97316' // orange
  }
  if (categoryLower.includes('dining') || categoryLower.includes('restaurant') || categoryLower.includes('☕') || categoryLower.includes('🍽️')) {
    return '#f59e0b' // amber
  }
  if (categoryLower.includes('transport') || categoryLower.includes('🚗') || categoryLower.includes('⛽')) {
    return '#0ea5e9' // sky
  }
  if (categoryLower.includes('entertainment') || categoryLower.includes('🎬')) {
    return '#f43f5e' // rose
  }
  if (categoryLower.includes('utilities') || categoryLower.includes('💡')) {
    return '#facc15' // yellow
  }
  if (categoryLower.includes('health') || categoryLower.includes('💊') || categoryLower.includes('🏋️')) {
    return '#14b8a6' // teal
  }
  if (categoryLower.includes('travel') || categoryLower.includes('✈️')) {
    return '#06b6d4' // cyan
  }
  if (categoryLower.includes('home') || categoryLower.includes('🏠')) {
    return '#84cc16' // lime
  }
  
  return '#9ca3af' // gray for other
}

/**
 * Get all category colors as a map
 */
export function getCategoryColors(categories: string[]): Record<string, string> {
  const colors: Record<string, string> = {}
  categories.forEach(cat => {
    colors[cat] = getCategoryColor(cat)
  })
  return colors
}
