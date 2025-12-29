import { Expense, ExpensesApiResponse, DateRange } from './types'
import type { CraftConfig } from './craftConfig'
import { getCraftConfig, normalizeCraftConfig } from './craftConfig'
import {
  buildCraftCollectionsUrl,
  buildCraftItemsUrl,
  selectCollectionId,
} from './craftApi'
import { mapCraftItemToExpense } from './expenseMapping'
import {
  calculateStats,
  aggregateByCategory,
  aggregateByMerchant,
  aggregateByMonth,
  aggregateByDay,
  filterExpensesByDateRange,
} from './utils'

interface CraftApiResponse {
  items: Array<{
    id: string
    title?: string
    merchant?: string
    properties?: Record<string, unknown>
    content?: unknown[]
  }>
}

/**
 * Fetch expenses directly from Craft using user-provided credentials
 */
export async function fetchExpensesFromUserConfig(
  range: DateRange = 'all'
): Promise<ExpensesApiResponse> {
  const storedConfig = getCraftConfig()
  const config = storedConfig ? normalizeCraftConfig(storedConfig) : null

  if (!config || !config.apiBaseUrl) {
    throw new Error('No Craft API configuration found. Please configure in Settings.')
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  // Add Bearer token when Access Mode uses API Key
  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`
  }

  const resolvedCollectionId = await resolveCollectionId(config, headers)
  const apiUrl = buildCraftItemsUrl(config, resolvedCollectionId)
  const response = await fetch(apiUrl, { headers })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        `Craft API unauthorized (401). If Access Mode is API Key, verify the key. If Access Mode is Public, leave API Key empty. URL: ${apiUrl}`
      )
    }
    if (response.status === 404) {
      throw new Error(
        `Craft API not found (404). Please check:\n• API Base URL is correct\n• Collection or Document ID exists\n• URL tried: ${apiUrl}`
      )
    }
    throw new Error(
      `Failed to fetch from Craft API: ${response.status} ${response.statusText}\nURL: ${apiUrl}`
    )
  }

  const data: CraftApiResponse = await response.json()

  const allExpenses: Expense[] = data.items.map((item) =>
    mapCraftItemToExpense({
      id: item.id,
      title: item.title,
      merchant: item.merchant,
      properties: item.properties,
    })
  )

  // Filter by date range
  const expenses = filterExpensesByDateRange(allExpenses, range)

  // Calculate all aggregations
  const stats = calculateStats(expenses)
  const categoryBreakdown = aggregateByCategory(expenses)
  const merchantBreakdown = aggregateByMerchant(expenses)
  const monthlyTrend = aggregateByMonth(allExpenses)
  const dailyTrend = aggregateByDay(expenses)

  return {
    expenses,
    stats,
    categoryBreakdown,
    merchantBreakdown,
    monthlyTrend,
    dailyTrend,
  }
}

/**
 * Check if user has configured their own API credentials
 */
export function hasUserConfig(): boolean {
  const config = getCraftConfig()
  return !!(config && config.apiBaseUrl)
}

async function resolveCollectionId(
  config: CraftConfig,
  headers: HeadersInit
): Promise<string> {
  if (config.collectionId) {
    return config.collectionId
  }

  const collectionsUrl = buildCraftCollectionsUrl(config)

  if (!collectionsUrl) {
    throw new Error('Collection ID is required or a valid API Base URL is needed to discover collections.')
  }

  const collectionsResponse = await fetch(collectionsUrl, { headers })
  if (!collectionsResponse.ok) {
    throw new Error(
      `Unable to list collections (${collectionsResponse.status}). Provide a Collection ID or verify API access.`
    )
  }

  const collectionsData = await collectionsResponse.json()
  const collectionId = selectCollectionId(collectionsData.items || [])

  if (!collectionId) {
    throw new Error('No collections found. Provide a Collection ID or check API access.')
  }

  return collectionId
}
