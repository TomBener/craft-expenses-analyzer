// Raw expense data from Craft API
export interface CraftExpenseItem {
  id: string
  type: 'collectionItem'
  title: string
  merchant?: string
  properties: Record<string, unknown>
  markdown: string
  content: unknown[]
}

// Processed expense for our app
export interface Expense {
  id: string
  title: string
  merchant: string
  date: string // "2025-12-25"
  category: string // "🛒 Groceries"
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  summary: string
  loggedAt: string
}

// Budget configuration
export interface Budget {
  category: string
  monthlyLimit: number
}

// Category aggregation
export interface CategorySummary {
  category: string
  total: number
  count: number
  percentage: number
  color: string
}

// Merchant aggregation
export interface MerchantSummary {
  merchant: string
  total: number
  count: number
  averageTransaction: number
}

// Monthly aggregation
export interface MonthlySummary {
  month: string // "2025-12" or "Dec 2025"
  total: number
  count: number
}

// Daily aggregation for trends
export interface DailySummary {
  date: string
  total: number
  count: number
}

// Stats overview
export interface ExpenseStats {
  totalSpending: number
  transactionCount: number
  averageTransaction: number
  topCategory: string
  topMerchant: string
  topPaymentMethod: string
}

// Budget progress
export interface BudgetProgress {
  category: string
  spent: number
  limit: number
  percentage: number
  status: 'safe' | 'warning' | 'danger'
}

// Date filter options
export type DateRange = 'all' | 'thisMonth' | 'lastMonth' | 'last3Months' | 'thisYear'

// API Response types
export interface ExpensesApiResponse {
  expenses: Expense[]
  stats: ExpenseStats
  categoryBreakdown: CategorySummary[]
  merchantBreakdown: MerchantSummary[]
  monthlyTrend: MonthlySummary[]
  dailyTrend: DailySummary[]
}
