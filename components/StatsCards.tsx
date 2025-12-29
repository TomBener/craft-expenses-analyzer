'use client'

import { ExpenseStats } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  Receipt,
  TrendingUp,
  Tag,
  Store,
  CreditCard,
} from 'lucide-react'

interface StatsCardsProps {
  stats: ExpenseStats
  isLoading?: boolean
}

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  delay?: number
}

function StatCard({ title, value, subtitle, icon, delay = 0 }: StatCardProps) {
  return (
    <div
      className="group card-hover animate-slide-up relative overflow-hidden"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[color:var(--accent)]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
      </div>

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="stat-label mb-3 text-xs">{title}</p>
          <p className="stat-value break-words leading-tight mb-2 text-3xl font-extrabold">{value}</p>
          {subtitle && (
            <p className="text-xs text-[var(--muted-foreground)] font-medium flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--accent)] opacity-60"></span>
              {subtitle}
            </p>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-transparent rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <div className="relative p-4 rounded-2xl bg-[var(--accent)] text-[var(--accent-foreground)] flex-shrink-0 shadow-xl group-hover:shadow-2xl group-hover:scale-110 transition-all duration-300">
            {icon}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 w-24 bg-[var(--muted)] rounded" />
          <div className="h-8 w-32 bg-[var(--muted)] rounded mt-2" />
        </div>
        <div className="h-10 w-10 bg-[var(--muted)] rounded-xl" />
      </div>
    </div>
  )
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {[...Array(6)].map((_, i) => (
          <LoadingSkeleton key={i} />
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Spending',
      value: formatCurrency(stats.totalSpending),
      subtitle: 'all transactions',
      icon: <DollarSign className="w-6 h-6" strokeWidth={1.6} />,
    },
    {
      title: 'Transactions',
      value: stats.transactionCount.toString(),
      subtitle: 'receipts logged',
      icon: <Receipt className="w-6 h-6" strokeWidth={1.6} />,
    },
    {
      title: 'Average',
      value: formatCurrency(stats.averageTransaction),
      subtitle: 'per transaction',
      icon: <TrendingUp className="w-6 h-6" strokeWidth={1.6} />,
    },
    {
      title: 'Top Category',
      value: stats.topCategory,
      subtitle: 'most frequent',
      icon: <Tag className="w-6 h-6" strokeWidth={1.6} />,
    },
    {
      title: 'Top Merchant',
      value: stats.topMerchant,
      subtitle: 'most visited',
      icon: <Store className="w-6 h-6" strokeWidth={1.6} />,
    },
    {
      title: 'Preferred Payment',
      value: stats.topPaymentMethod,
      subtitle: 'highest spend',
      icon: <CreditCard className="w-6 h-6" strokeWidth={1.6} />,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {cards.map((card, index) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          subtitle={card.subtitle}
          icon={card.icon}
          delay={index * 50}
        />
      ))}
    </div>
  )
}
