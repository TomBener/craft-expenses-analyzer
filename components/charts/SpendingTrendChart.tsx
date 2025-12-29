'use client'

import { DailySummary } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'

interface SpendingTrendChartProps {
  data: DailySummary[]
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: DailySummary
    value: number
  }>
  label?: string
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 shadow-lg">
      <p className="font-medium">{formatDate(data.date)}</p>
      <p className="text-sm text-[var(--accent)] font-mono">
        {formatCurrency(data.total)}
      </p>
      <p className="text-xs text-[var(--muted-foreground)]">
        {data.count} transaction{data.count !== 1 ? 's' : ''}
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

export default function SpendingTrendChart({ data, isLoading }: SpendingTrendChartProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title">Spending Trend</h3>
        <div className="flex items-center justify-center h-[300px] text-[var(--muted-foreground)]">
          No trend data available
        </div>
      </div>
    )
  }

  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    displayDate: format(parseISO(item.date), 'MMM d'),
  }))

  return (
    <div className="card animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[color:var(--accent)]/10 to-transparent rounded-full blur-3xl"></div>
      <h3 className="section-title relative flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)] rounded-full"></span>
        Spending Trend
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={(value) => `$${value}`}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
            activeDot={{ r: 6, stroke: 'var(--chart-1)', strokeWidth: 2, fill: 'var(--card)' }}
            animationBegin={0}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
