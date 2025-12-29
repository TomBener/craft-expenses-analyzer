import {
  Expense,
  ExpenseStats,
  CategorySummary,
  MerchantSummary,
  MonthlySummary,
  DailySummary,
  Budget,
  BudgetProgress,
  DateRange,
} from './types'
import { getCategoryColor } from './craft'
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  parseISO,
  format,
  isWithinInterval,
  compareDesc,
} from 'date-fns'

/**
 * Filter expenses by date range
 */
export function filterExpensesByDateRange(
  expenses: Expense[],
  range: DateRange
): Expense[] {
  if (range === 'all') return expenses

  const now = new Date()
  let start: Date
  let end: Date = now

  switch (range) {
    case 'thisMonth':
      start = startOfMonth(now)
      end = endOfMonth(now)
      break
    case 'lastMonth':
      start = startOfMonth(subMonths(now, 1))
      end = endOfMonth(subMonths(now, 1))
      break
    case 'last3Months':
      start = startOfMonth(subMonths(now, 2))
      end = endOfMonth(now)
      break
    case 'thisYear':
      start = startOfYear(now)
      end = now
      break
    default:
      return expenses
  }

  return expenses.filter((expense) => {
    if (!expense.date) return false
    const expenseDate = parseISO(expense.date)
    return isWithinInterval(expenseDate, { start, end })
  })
}

/**
 * Calculate overall expense statistics
 */
export function calculateStats(expenses: Expense[]): ExpenseStats {
  if (expenses.length === 0) {
    return {
      totalSpending: 0,
      transactionCount: 0,
      averageTransaction: 0,
      topCategory: 'N/A',
      topMerchant: 'N/A',
      topPaymentMethod: 'N/A',
    }
  }

  const totalSpending = expenses.reduce((sum, e) => sum + e.total, 0)

  // Find top category
  const categoryTotals = new Map<string, number>()
  expenses.forEach((e) => {
    const current = categoryTotals.get(e.category) || 0
    categoryTotals.set(e.category, current + e.total)
  })
  const topCategory = [...categoryTotals.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 'N/A'

  // Find top merchant
  const merchantTotals = new Map<string, number>()
  expenses.forEach((e) => {
    const current = merchantTotals.get(e.merchant) || 0
    merchantTotals.set(e.merchant, current + e.total)
  })
  const topMerchant = [...merchantTotals.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 'N/A'

  const paymentTotals = new Map<string, number>()
  expenses.forEach((e) => {
    const key = e.paymentMethod?.trim() || 'Unknown'
    const current = paymentTotals.get(key) || 0
    paymentTotals.set(key, current + e.total)
  })
  const topPaymentMethod = [...paymentTotals.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0]?.[0] || 'N/A'

  return {
    totalSpending,
    transactionCount: expenses.length,
    averageTransaction: totalSpending / expenses.length,
    topCategory,
    topMerchant,
    topPaymentMethod,
  }
}

/**
 * Aggregate expenses by category
 */
export function aggregateByCategory(expenses: Expense[]): CategorySummary[] {
  const categoryMap = new Map<string, { total: number; count: number }>()

  expenses.forEach((expense) => {
    const current = categoryMap.get(expense.category) || { total: 0, count: 0 }
    categoryMap.set(expense.category, {
      total: current.total + expense.total,
      count: current.count + 1,
    })
  })

  const totalSpending = expenses.reduce((sum, e) => sum + e.total, 0)

  return [...categoryMap.entries()]
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Aggregate expenses by merchant
 */
export function aggregateByMerchant(expenses: Expense[]): MerchantSummary[] {
  const merchantMap = new Map<string, { total: number; count: number }>()

  expenses.forEach((expense) => {
    const current = merchantMap.get(expense.merchant) || { total: 0, count: 0 }
    merchantMap.set(expense.merchant, {
      total: current.total + expense.total,
      count: current.count + 1,
    })
  })

  return [...merchantMap.entries()]
    .map(([merchant, data]) => ({
      merchant,
      total: data.total,
      count: data.count,
      averageTransaction: data.total / data.count,
    }))
    .sort((a, b) => b.total - a.total)
}

/**
 * Aggregate expenses by month
 */
export function aggregateByMonth(expenses: Expense[]): MonthlySummary[] {
  const monthMap = new Map<string, { total: number; count: number }>()

  expenses.forEach((expense) => {
    if (!expense.date) return
    const monthKey = expense.date.substring(0, 7) // "2025-12"
    const current = monthMap.get(monthKey) || { total: 0, count: 0 }
    monthMap.set(monthKey, {
      total: current.total + expense.total,
      count: current.count + 1,
    })
  })

  return [...monthMap.entries()]
    .map(([month, data]) => ({
      month: formatMonthLabel(month),
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Aggregate expenses by day
 */
export function aggregateByDay(expenses: Expense[]): DailySummary[] {
  const dayMap = new Map<string, { total: number; count: number }>()

  expenses.forEach((expense) => {
    if (!expense.date) return
    const current = dayMap.get(expense.date) || { total: 0, count: 0 }
    dayMap.set(expense.date, {
      total: current.total + expense.total,
      count: current.count + 1,
    })
  })

  return [...dayMap.entries()]
    .map(([date, data]) => ({
      date,
      total: data.total,
      count: data.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Calculate budget progress for each category
 */
export function calculateBudgetProgress(
  expenses: Expense[],
  budgets: Budget[]
): BudgetProgress[] {
  // Filter to current month only
  const currentMonthExpenses = filterExpensesByDateRange(expenses, 'thisMonth')

  // Calculate spending per category
  const categorySpending = new Map<string, number>()
  currentMonthExpenses.forEach((expense) => {
    const current = categorySpending.get(expense.category) || 0
    categorySpending.set(expense.category, current + expense.total)
  })

  return budgets.map((budget) => {
    const spent = categorySpending.get(budget.category) || 0
    const percentage = budget.monthlyLimit > 0 
      ? (spent / budget.monthlyLimit) * 100 
      : 0

    let status: 'safe' | 'warning' | 'danger' = 'safe'
    if (percentage >= 90) status = 'danger'
    else if (percentage >= 70) status = 'warning'

    return {
      category: budget.category,
      spent,
      limit: budget.monthlyLimit,
      percentage,
      status,
    }
  })
}

/**
 * Format month key to display label
 */
function formatMonthLabel(monthKey: string): string {
  try {
    const date = parseISO(`${monthKey}-01`)
    return format(date, 'MMM yyyy')
  } catch {
    return monthKey
  }
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr)
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

/**
 * Get current month name
 */
export function getCurrentMonthName(): string {
  return format(new Date(), 'MMMM yyyy')
}

/**
 * Sort expenses by date (newest first)
 */
export function sortExpensesByDate(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => {
    if (!a.date || !b.date) return 0
    return compareDesc(parseISO(a.date), parseISO(b.date))
  })
}

/**
 * clsx utility for conditional class names
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
