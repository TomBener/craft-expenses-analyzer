'use client'

import { CategorySummary } from '@/lib/types'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

interface CategoryPieChartProps {
  data: CategorySummary[]
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: CategorySummary
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 shadow-2xl backdrop-blur-sm">
      <p className="font-bold text-base mb-2">{data.category}</p>
      <p className="text-sm font-semibold text-[var(--accent)] mb-1">
        {formatCurrency(data.total)}
      </p>
      <p className="text-xs text-[var(--muted-foreground)] font-medium">
        {formatPercentage(data.percentage)} • {data.count} transaction{data.count !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-5 w-40 bg-[var(--muted)] rounded mb-4" />
      <div className="flex items-center justify-center h-[300px]">
        <div className="w-48 h-48 rounded-full bg-[var(--muted)]" />
      </div>
    </div>
  )
}

export default function CategoryPieChart({ data, isLoading }: CategoryPieChartProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title">Spending by Category</h3>
        <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">
          No expense data available
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[color:var(--accent)]/10 to-transparent rounded-full blur-3xl"></div>
      <h3 className="section-title relative flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)] rounded-full"></span>
        Spending by Category
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="total"
            nameKey="category"
            animationBegin={0}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="var(--background)"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Category breakdown list */}
      <div className="mt-6 space-y-3 pt-6 border-t border-[var(--border)]">
        {data.map((item, index) => (
          <div
            key={item.category}
            className="group flex items-center justify-between p-3 rounded-xl hover:bg-[var(--muted)] transition-all duration-200"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-4 h-4 rounded-full shadow-sm group-hover:scale-125 transition-transform duration-200"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.category}</p>
                <p className="text-xs text-[var(--muted-foreground)] font-medium">
                  {item.count} transaction{item.count !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <div className="text-right ml-3">
              <p className="font-mono font-bold text-sm">
                {formatCurrency(item.total)}
              </p>
              <p className="text-xs text-[var(--muted-foreground)] font-semibold">
                {formatPercentage(item.percentage)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
