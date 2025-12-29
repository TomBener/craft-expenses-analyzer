'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ExpensesApiResponse, DateRange } from '@/lib/types'
import type { CraftConfig } from '@/lib/craftConfig'
import { formatCurrency, getCurrentMonthName, sortExpensesByDate } from '@/lib/utils'
import { getCategoryColor } from '@/lib/craft'
import { fetchExpensesFromUserConfig, hasUserConfig } from '@/lib/clientCraft'

import Header from './Header'
import StatsCards from './StatsCards'
import DateRangeFilter from './DateRangeFilter'
import CategoryPieChart from './charts/CategoryPieChart'
import SpendingTrendChart from './charts/SpendingTrendChart'
import MonthlySummary from './charts/MonthlySummary'
import MerchantBar from './charts/MerchantBar'
import BudgetProgress from './BudgetProgress'
import SettingsModal from './SettingsModal'

export default function Dashboard() {
  const [data, setData] = useState<ExpensesApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<DateRange>('thisMonth')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [dataSource, setDataSource] = useState<'mock' | 'server' | 'user'>('mock')
  const [useUserConfig, setUseUserConfig] = useState(false)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    setUseUserConfig(false)
    setDataSource('mock')
  }, [])

  const fetchData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)

      let result: ExpensesApiResponse

      // Check if user has configured their own API
      if (useUserConfig && hasUserConfig()) {
        // Use client-side fetching with user's config
        result = await fetchExpensesFromUserConfig(dateRange)
        setDataSource('user')
      } else {
        // Use server-side API (which may use .env.local or mock data)
        const response = await fetch(`/api/expenses?range=${dateRange}&source=mock`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch expenses')
        }

        result = await response.json()
        setDataSource('mock')
      }

      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [dateRange, useUserConfig])

  useEffect(() => {
    if (hasLoadedRef.current) {
      fetchData(true)
      return
    }

    hasLoadedRef.current = true
    fetchData()
  }, [fetchData])

  const handleRefresh = () => {
    fetchData(true)
  }

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range)
  }

  const handleSettingsSave = (config: CraftConfig) => {
    // After saving settings, check if user has config and refresh
    const hasConfig = !!config.apiBaseUrl
    setUseUserConfig(hasConfig)
    setDataSource(hasConfig ? 'user' : 'mock')
    setIsSettingsOpen(false)
  }

  if (error) {
    return (
      <>
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSettingsSave}
        />
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Connection Error</h2>
            <p className="text-red-500 mb-6 text-sm bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setIsSettingsOpen(true)} className="btn-secondary">
                Open Settings
              </button>
              <button onClick={handleRefresh} className="btn-primary">
                Try Again
              </button>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-4">
              Check your API configuration in Settings or try refreshing the connection.
            </p>
          </div>
        </div>
      </>
    )
  }

  const stats = data?.stats || {
    totalSpending: 0,
    transactionCount: 0,
    averageTransaction: 0,
    topCategory: 'N/A',
    topMerchant: 'N/A',
    topPaymentMethod: 'N/A',
  }

  const sortedExpenses = sortExpensesByDate(data?.expenses || [])
  const getCategoryBadgeStyle = (category: string) => {
    const baseColor = getCategoryColor(category)
    return {
      background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}cc 100%)`,
      boxShadow: `0 14px 30px -20px ${baseColor}99`,
    }
  }

  return (
    <div className="min-h-screen">
      <Header 
        onRefresh={handleRefresh} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        isRefreshing={isRefreshing}
        dataSource={dataSource}
      />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-10 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="card relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,186,140,0.25),_transparent_60%)]"></div>
              <div className="relative flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted-foreground)] font-semibold mb-3">
                      Overview
                    </p>
                    <h1 className="text-4xl sm:text-5xl font-black leading-tight">
                      {dateRange === 'thisMonth'
                        ? getCurrentMonthName()
                        : dateRange === 'all'
                          ? 'All Time'
                          : 'Expense Overview'
                      }
                    </h1>
                    <p className="text-[var(--muted-foreground)] text-sm sm:text-base mt-3 max-w-lg">
                      A live pulse of your spending, refreshed from Craft with curated insights and a clearer money story.
                    </p>
                  </div>
                  <DateRangeFilter value={dateRange} onChange={handleDateRangeChange} />
                </div>
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--muted)]/60 px-4 py-4">
                    <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-semibold mb-2">
                      Total Spend
                    </p>
                    <p className="text-2xl font-black font-mono">
                      {formatCurrency(stats.totalSpending)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--muted)]/60 px-4 py-4">
                    <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-semibold mb-2">
                      Transactions
                    </p>
                    <p className="text-2xl font-black">{stats.transactionCount}</p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--border)]/70 bg-[color:var(--muted)]/60 px-4 py-4">
                    <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-semibold mb-2">
                      Preferred Payment
                    </p>
                    <p className="text-xl font-semibold truncate">{stats.topPaymentMethod}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(125,211,252,0.3),_transparent_60%)]"></div>
              <div className="relative">
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted-foreground)] font-semibold mb-6">
                  Highlights
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 border border-[color:var(--border)]/70 rounded-2xl px-4 py-3 bg-[color:var(--muted)]/60">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-semibold">Top Category</p>
                      <p className="text-lg font-semibold">{stats.topCategory}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">By spend</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border border-[color:var(--border)]/70 rounded-2xl px-4 py-3 bg-[color:var(--muted)]/60">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-semibold">Top Merchant</p>
                      <p className="text-lg font-semibold truncate max-w-[180px]">{stats.topMerchant}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">By spend</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 border border-[color:var(--border)]/70 rounded-2xl px-4 py-3 bg-[color:var(--muted)]/60">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[var(--muted-foreground)] font-semibold">Avg Ticket</p>
                      <p className="text-lg font-semibold font-mono">{formatCurrency(stats.averageTransaction)}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--muted-foreground)]">USD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats cards */}
        <section className="mb-10">
          <StatsCards
            stats={stats}
            isLoading={isLoading}
          />
        </section>

        {/* Charts grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-12">
            <SpendingTrendChart
              data={data?.dailyTrend || []}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-5">
            <CategoryPieChart
              data={data?.categoryBreakdown || []}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-4">
            <BudgetProgress
              expenses={data?.expenses || []}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-3">
            <MonthlySummary
              data={data?.monthlyTrend || []}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-12">
            <MerchantBar
              data={data?.merchantBreakdown || []}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Recent transactions */}
        <section className="mb-10">
          <div className="card animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="section-title mb-0">Recent Transactions</h3>
              {!isLoading && data?.expenses && data.expenses.length > 0 && (
                <span className="text-sm text-[var(--muted-foreground)] font-medium">
                  Showing {Math.min(10, data.expenses.length)} of {data.expenses.length}
                </span>
              )}
            </div>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-[var(--muted)] animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--border)] rounded-full" />
                      <div>
                        <div className="h-4 w-32 bg-[var(--border)] rounded mb-2" />
                        <div className="h-3 w-24 bg-[var(--border)] rounded" />
                      </div>
                    </div>
                    <div className="h-5 w-20 bg-[var(--border)] rounded" />
                  </div>
                ))}
              </div>
            ) : sortedExpenses.length > 0 ? (
              <div className="space-y-3">
                {sortedExpenses.slice(0, 10).map((expense, index) => (
                  <div
                    key={expense.id}
                    className="group flex items-center justify-between p-5 rounded-2xl hover:bg-[color:var(--muted)]/50 transition-all duration-300 border border-transparent hover:border-[color:var(--accent)]/20 hover:shadow-lg relative overflow-hidden"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {/* Hover gradient effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--accent)]/0 via-[color:var(--accent)]/10 to-[color:var(--accent)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative flex items-center gap-4 flex-1 min-w-0">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl blur-sm opacity-40 group-hover:opacity-60 transition-opacity"
                          style={getCategoryBadgeStyle(expense.category)}
                        />
                        <div
                          className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300"
                          style={getCategoryBadgeStyle(expense.category)}
                        >
                          {expense.category.split(' ')[0]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate text-base">
                          {expense.merchant}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)] font-medium mt-1.5">
                          <span className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[var(--muted-foreground)]"></span>
                            {expense.date}
                          </span>
                          <span>•</span>
                          <span className="badge bg-[color:var(--muted)]/70 border border-[var(--border)] text-[var(--foreground)] uppercase tracking-[0.2em]">
                            {expense.paymentMethod}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative text-right ml-4">
                      <p className="font-mono font-bold text-xl text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                        ${expense.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] font-semibold mt-2 px-2.5 py-1 rounded-full bg-[var(--muted)] inline-flex items-center gap-1">
                        {expense.category.split(' ').slice(1).join(' ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-[var(--muted-foreground)] text-lg font-medium">
                  No transactions found
                </p>
                <p className="text-[var(--muted-foreground)] text-sm mt-2">
                  Start tracking your expenses to see them here
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-[var(--muted-foreground)] py-10 border-t border-[var(--border)] mt-6">
          <div className="space-y-3">
            <p>
              Built for the{' '}
              <span className="font-semibold gradient-text">
                Craft Winter Challenge
              </span>
            </p>
            <p className="flex items-center justify-center gap-2">
              <span>⚡</span>
              <span>Synced with Craft via Apple Shortcuts</span>
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
