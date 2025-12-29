import type { Expense } from './types'

type CraftProperties = Record<string, unknown>

const PROPERTY_ALIASES = {
  merchant: ['merchant', 'store', 'vendor', 'payee', 'shop', 'place', 'company'],
  date: ['date', 'transactiondate', 'purchasedate', 'spenton', 'spentdate', 'expensedate'],
  category: ['category', 'type', 'group', 'expensecategory'],
  subtotal: ['subtotal', 'pretax', 'beforetax', 'net', 'amountbeforetax'],
  tax: ['tax', 'vat', 'gst'],
  total: ['total', 'amount', 'cost', 'spent', 'price', 'sum', 'totalamount', 'amounttotal'],
  paymentMethod: ['paymentmethod', 'payment', 'paidwith', 'method', 'card', 'paymenttype'],
  summary: ['summary', 'note', 'notes', 'description', 'memo', 'details'],
  loggedAt: ['loggedat', 'createdat', 'logtime', 'timestamp'],
}

export function mapCraftItemToExpense(item: {
  id: string
  title?: string
  merchant?: string
  properties?: CraftProperties
}): Expense {
  const properties = item.properties ?? {}

  const merchant =
    getStringProperty(properties, PROPERTY_ALIASES.merchant) ||
    normalizeStringValue(item.merchant) ||
    item.title ||
    'Unknown'

  const date = getStringProperty(properties, PROPERTY_ALIASES.date) || ''
  const category =
    getStringProperty(properties, PROPERTY_ALIASES.category) || '📦 Other'
  const subtotal = getNumberProperty(properties, PROPERTY_ALIASES.subtotal)
  const tax = getNumberProperty(properties, PROPERTY_ALIASES.tax)
  let total = getNumberProperty(properties, PROPERTY_ALIASES.total)
  if (!total && subtotal) {
    total = subtotal
  }
  const paymentMethod =
    getStringProperty(properties, PROPERTY_ALIASES.paymentMethod) || 'Unknown'
  const summary = getStringProperty(properties, PROPERTY_ALIASES.summary) || ''
  const loggedAt = getStringProperty(properties, PROPERTY_ALIASES.loggedAt) || ''

  return {
    id: item.id,
    title: item.title || merchant,
    merchant,
    date,
    category,
    subtotal,
    tax,
    total,
    paymentMethod,
    summary,
    loggedAt,
  }
}

function getStringProperty(properties: CraftProperties, aliases: string[]): string | undefined {
  const value = getPropertyValue(properties, aliases)
  if (value === undefined || value === null) return undefined

  if (Array.isArray(value)) {
    const mapped = value
      .map((entry) => normalizeStringValue(entry))
      .filter(Boolean)
    return mapped.join(', ') || undefined
  }

  return normalizeStringValue(value)
}

function getNumberProperty(properties: CraftProperties, aliases: string[]): number {
  const value = getPropertyValue(properties, aliases)
  if (value === undefined || value === null) return 0

  if (typeof value === 'number') return value

  const normalized = normalizeStringValue(value)
  if (!normalized) return 0

  const parsed = Number(normalized.replace(/[^0-9.-]+/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

function getPropertyValue(properties: CraftProperties, aliases: string[]): unknown {
  const normalizedMap = new Map<string, unknown>()

  Object.entries(properties).forEach(([key, value]) => {
    normalizedMap.set(normalizeKey(key), value)
  })

  for (const alias of aliases) {
    const value = normalizedMap.get(normalizeKey(alias))
    if (value !== undefined) {
      return value
    }
  }

  return undefined
}

function normalizeStringValue(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    if (typeof record.title === 'string') return record.title
    if (typeof record.name === 'string') return record.name
    if (typeof record.value === 'string') return record.value
  }

  return undefined
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}
