'use client'

import { MerchantSummary } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface MerchantBarProps {
  data: MerchantSummary[]
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: MerchantSummary
    value: number
  }>
}

// Gradient colors for bars
const COLORS = [
  '#ff6b35',
  '#ffb347',
  '#06b6d4',
  '#22c55e',
  '#f43f5e',
]

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 shadow-lg">
      <p className="font-medium">{data.merchant}</p>
      <p className="text-sm text-[var(--accent)] font-mono">
        {formatCurrency(data.total)}
      </p>
      <p className="text-xs text-[var(--muted-foreground)]">
        {data.count} visit{data.count !== 1 ? 's' : ''} · Avg: {formatCurrency(data.averageTransaction)}
      </p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-5 w-40 bg-[var(--muted)] rounded mb-4" />
      <div className="h-[300px] bg-[var(--muted)] rounded" />
    </div>
  )
}

export default function MerchantBar({ data, isLoading }: MerchantBarProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title">Top Merchants</h3>
        <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">
          No merchant data available
        </div>
      </div>
    )
  }

  // Get top 5 merchants
  const topMerchants = data.slice(0, 5)

  return (
    <div className="card animate-fade-in relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-[color:var(--accent)]/10 to-transparent rounded-full blur-3xl"></div>
      <h3 className="section-title relative flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)] rounded-full"></span>
        Top Merchants
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={topMerchants}
          layout="vertical"
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
          />
          <YAxis
            type="category"
            dataKey="merchant"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--foreground)', fontSize: 12 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="total"
            radius={[0, 4, 4, 0]}
            animationBegin={0}
            animationDuration={800}
          >
            {topMerchants.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

    </div>
  )
}
