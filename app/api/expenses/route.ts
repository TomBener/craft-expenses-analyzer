import { NextResponse } from 'next/server'
import { fetchExpensesFromCraft } from '@/lib/craft'
import {
  calculateStats,
  aggregateByCategory,
  aggregateByMerchant,
  aggregateByMonth,
  aggregateByDay,
  filterExpensesByDateRange,
} from '@/lib/utils'
import { DateRange, ExpensesApiResponse } from '@/lib/types'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = (searchParams.get('range') || 'all') as DateRange
    const source = searchParams.get('source') || 'auto'

    if (source === 'mock') {
      return NextResponse.json(getMockData())
    }

    // Fetch expenses from Craft
    const allExpenses = await fetchExpensesFromCraft()

    // Filter by date range
    const expenses = filterExpensesByDateRange(allExpenses, range)

    // Calculate all aggregations
    const stats = calculateStats(expenses)
    const categoryBreakdown = aggregateByCategory(expenses)
    const merchantBreakdown = aggregateByMerchant(expenses)
    const monthlyTrend = aggregateByMonth(allExpenses) // Always show all months for trend
    const dailyTrend = aggregateByDay(expenses)

    const response: ExpensesApiResponse = {
      expenses,
      stats,
      categoryBreakdown,
      merchantBreakdown,
      monthlyTrend,
      dailyTrend,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching expenses:', error)
    
    // Return mock data for development without API token
    if (error instanceof Error && error.message.includes('CRAFT_API_TOKEN')) {
      return NextResponse.json(getMockData())
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}

// Mock data for development/demo - 20 diverse transactions
function getMockData(): ExpensesApiResponse {
  const mockExpenses = [
    {
      id: '1',
      title: 'Whole Foods - 2025-12-25',
      merchant: 'Whole Foods',
      date: '2025-12-25',
      category: '🛒 Groceries',
      subtotal: 156.20,
      tax: 13.28,
      total: 169.48,
      paymentMethod: 'Visa',
      summary: 'Weekly grocery shopping',
      loggedAt: 'Dec 25, 2025 at 20:23:16',
    },
    {
      id: '2',
      title: 'Shell Gas Station - 2025-12-24',
      merchant: 'Shell',
      date: '2025-12-24',
      category: '⛽ Transportation',
      subtotal: 68.40,
      tax: 0,
      total: 68.40,
      paymentMethod: 'Credit Card',
      summary: 'Gas fill-up',
      loggedAt: 'Dec 24, 2025 at 18:15:00',
    },
    {
      id: '3',
      title: 'AMC Theatres - 2025-12-23',
      merchant: 'AMC Theatres',
      date: '2025-12-23',
      category: '🎬 Entertainment',
      subtotal: 42.00,
      tax: 3.36,
      total: 45.36,
      paymentMethod: 'Apple Pay',
      summary: 'Movie tickets and popcorn',
      loggedAt: 'Dec 23, 2025 at 19:30:00',
    },
    {
      id: '4',
      title: 'Starbucks - 2025-12-22',
      merchant: 'Starbucks',
      date: '2025-12-22',
      category: '☕ Dining',
      subtotal: 12.85,
      tax: 1.15,
      total: 14.00,
      paymentMethod: 'Debit Card',
      summary: 'Morning coffee and pastry',
      loggedAt: 'Dec 22, 2025 at 08:45:00',
    },
    {
      id: '5',
      title: 'CVS Pharmacy - 2025-12-20',
      merchant: 'CVS',
      date: '2025-12-20',
      category: '🛍️ Shopping',
      subtotal: 34.99,
      tax: 2.80,
      total: 37.79,
      paymentMethod: 'HSA Card',
      summary: 'Prescription medication',
      loggedAt: 'Dec 20, 2025 at 15:20:00',
    },
    {
      id: '6',
      title: 'LA Fitness - 2025-12-15',
      merchant: 'LA Fitness',
      date: '2025-12-15',
      category: '💡 Utilities',
      subtotal: 39.99,
      tax: 0,
      total: 39.99,
      paymentMethod: 'Auto-pay',
      summary: 'Monthly gym membership',
      loggedAt: 'Dec 15, 2025 at 00:01:00',
    },
    {
      id: '7',
      title: 'Amazon - 2025-12-18',
      merchant: 'Amazon',
      date: '2025-12-18',
      category: '🛍️ Shopping',
      subtotal: 87.50,
      tax: 7.00,
      total: 94.50,
      paymentMethod: 'Amazon Card',
      summary: 'Books and home supplies',
      loggedAt: 'Dec 18, 2025 at 14:22:00',
    },
    {
      id: '8',
      title: 'Netflix - 2025-12-10',
      merchant: 'Netflix',
      date: '2025-12-10',
      category: '🎬 Entertainment',
      subtotal: 15.49,
      tax: 0,
      total: 15.49,
      paymentMethod: 'Credit Card',
      summary: 'Monthly subscription',
      loggedAt: 'Dec 10, 2025 at 00:00:00',
    },
    {
      id: '9',
      title: 'Chipotle - 2025-12-17',
      merchant: 'Chipotle',
      date: '2025-12-17',
      category: '☕ Dining',
      subtotal: 18.25,
      tax: 1.64,
      total: 19.89,
      paymentMethod: 'Apple Pay',
      summary: 'Burrito bowl lunch',
      loggedAt: 'Dec 17, 2025 at 12:30:00',
    },
    {
      id: '10',
      title: 'PG&E - 2025-12-05',
      merchant: 'PG&E',
      date: '2025-12-05',
      category: '💡 Utilities',
      subtotal: 124.67,
      tax: 0,
      total: 124.67,
      paymentMethod: 'Bank Transfer',
      summary: 'Electric and gas bill',
      loggedAt: 'Dec 5, 2025 at 09:00:00',
    },
    {
      id: '11',
      title: 'Trader Joes - 2025-12-14',
      merchant: 'Trader Joes',
      date: '2025-12-14',
      category: '🛒 Groceries',
      subtotal: 73.40,
      tax: 0,
      total: 73.40,
      paymentMethod: 'Debit Card',
      summary: 'Specialty items and snacks',
      loggedAt: 'Dec 14, 2025 at 16:45:00',
    },
    {
      id: '12',
      title: 'Uber - 2025-12-21',
      merchant: 'Uber',
      date: '2025-12-21',
      category: '⛽ Transportation',
      subtotal: 32.50,
      tax: 2.60,
      total: 35.10,
      paymentMethod: 'Uber Cash',
      summary: 'Ride to airport',
      loggedAt: 'Dec 21, 2025 at 06:30:00',
    },
    {
      id: '13',
      title: 'Target - 2025-12-12',
      merchant: 'Target',
      date: '2025-12-12',
      category: '🛍️ Shopping',
      subtotal: 145.80,
      tax: 13.12,
      total: 158.92,
      paymentMethod: 'RedCard',
      summary: 'Household items and clothing',
      loggedAt: 'Dec 12, 2025 at 14:15:00',
    },
    {
      id: '14',
      title: 'Verizon - 2025-12-01',
      merchant: 'Verizon',
      date: '2025-12-01',
      category: '💡 Utilities',
      subtotal: 89.99,
      tax: 7.20,
      total: 97.19,
      paymentMethod: 'Auto-pay',
      summary: 'Mobile phone service',
      loggedAt: 'Dec 1, 2025 at 00:05:00',
    },
    {
      id: '15',
      title: 'Olive Garden - 2025-12-19',
      merchant: 'Olive Garden',
      date: '2025-12-19',
      category: '☕ Dining',
      subtotal: 64.30,
      tax: 5.79,
      total: 70.09,
      paymentMethod: 'Credit Card',
      summary: 'Family dinner',
      loggedAt: 'Dec 19, 2025 at 19:00:00',
    },
    {
      id: '16',
      title: 'Spotify - 2025-12-08',
      merchant: 'Spotify',
      date: '2025-12-08',
      category: '🎬 Entertainment',
      subtotal: 10.99,
      tax: 0,
      total: 10.99,
      paymentMethod: 'PayPal',
      summary: 'Premium subscription',
      loggedAt: 'Dec 8, 2025 at 00:00:00',
    },
    {
      id: '17',
      title: 'Costco - 2025-11-28',
      merchant: 'Costco',
      date: '2025-11-28',
      category: '🛒 Groceries',
      subtotal: 234.56,
      tax: 0,
      total: 234.56,
      paymentMethod: 'Costco Card',
      summary: 'Bulk shopping for the month',
      loggedAt: 'Nov 28, 2025 at 11:30:00',
    },
    {
      id: '18',
      title: 'Planet Fitness - 2025-11-15',
      merchant: 'Planet Fitness',
      date: '2025-11-15',
      category: '💡 Utilities',
      subtotal: 22.99,
      tax: 0,
      total: 22.99,
      paymentMethod: 'Credit Card',
      summary: 'Black Card membership',
      loggedAt: 'Nov 15, 2025 at 00:01:00',
    },
    {
      id: '19',
      title: 'Safeway - 2025-12-07',
      merchant: 'Safeway',
      date: '2025-12-07',
      category: '🛒 Groceries',
      subtotal: 98.75,
      tax: 8.40,
      total: 107.15,
      paymentMethod: 'Visa',
      summary: 'Fresh produce and bakery',
      loggedAt: 'Dec 7, 2025 at 17:20:00',
    },
    {
      id: '20',
      title: 'Home Depot - 2025-12-03',
      merchant: 'Home Depot',
      date: '2025-12-03',
      category: '🏠 Home',
      subtotal: 186.42,
      tax: 16.78,
      total: 203.20,
      paymentMethod: 'Credit Card',
      summary: 'Home improvement supplies',
      loggedAt: 'Dec 3, 2025 at 10:45:00',
    },
  ]

  const allExpenses = mockExpenses
  const stats = calculateStats(allExpenses)
  const categoryBreakdown = aggregateByCategory(allExpenses)
  const merchantBreakdown = aggregateByMerchant(allExpenses)
  const monthlyTrend = aggregateByMonth(allExpenses)
  const dailyTrend = aggregateByDay(allExpenses)

  return {
    expenses: allExpenses,
    stats,
    categoryBreakdown,
    merchantBreakdown,
    monthlyTrend,
    dailyTrend,
  }
}
