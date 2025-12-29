'use client'

import { MonthlySummary as MonthlySummaryType } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface MonthlySummaryProps {
  data: MonthlySummaryType[]
  isLoading?: boolean
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload: MonthlySummaryType
    value: number
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const data = payload[0].payload
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-3 shadow-lg">
      <p className="font-medium">{data.month}</p>
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
      <div className="h-[250px] bg-[var(--muted)] rounded" />
    </div>
  )
}

export default function MonthlySummary({ data, isLoading }: MonthlySummaryProps) {
  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="section-title">Monthly Summary</h3>
        <div className="flex items-center justify-center h-[250px] text-[var(--muted-foreground)]">
          No monthly data available
        </div>
      </div>
    )
  }

  // Get last 6 months for display
  const recentData = data.slice(-6)

  return (
    <div className="card animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[color:var(--accent)]/10 to-transparent rounded-full blur-3xl"></div>
      <h3 className="section-title relative flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)] rounded-full"></span>
        Monthly Summary
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={recentData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
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
          <Bar
            dataKey="total"
            fill="var(--chart-3)"
            radius={[4, 4, 0, 0]}
            animationBegin={0}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
