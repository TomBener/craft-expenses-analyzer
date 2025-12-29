'use client'

import { DateRange } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Calendar } from 'lucide-react'

interface DateRangeFilterProps {
  value: DateRange
  onChange: (range: DateRange) => void
}

const options: { value: DateRange; label: string }[] = [
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'last3Months', label: 'Last 3 Months' },
  { value: 'thisYear', label: 'This Year' },
  { value: 'all', label: 'All Time' },
]

export default function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
        <div className="p-2 rounded-xl bg-[color:var(--muted)]/70 border border-[var(--border)]">
          <Calendar className="w-4 h-4" strokeWidth={1.6} />
        </div>
        <span className="text-sm font-semibold hidden sm:inline">Period:</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'px-4 py-2 text-sm font-semibold rounded-2xl transition-all duration-200 relative overflow-hidden',
              value === option.value
                ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-lg shadow-[0_15px_30px_-20px_var(--accent-shadow)] scale-105'
                : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[color:var(--accent)]/10 hover:text-[var(--accent)] hover:scale-105 active:scale-95'
            )}
          >
            {value === option.value && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] animate-shimmer"></div>
            )}
            <span className="relative">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
