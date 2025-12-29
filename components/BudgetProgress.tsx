'use client'

import { useState, useEffect } from 'react'
import { Budget, BudgetProgress as BudgetProgressType, Expense } from '@/lib/types'
import { calculateBudgetProgress, formatCurrency, formatPercentage, cn } from '@/lib/utils'
import { Settings, Plus, X, Check } from 'lucide-react'

interface BudgetProgressProps {
  expenses: Expense[]
  isLoading?: boolean
}

const DEFAULT_BUDGETS: Budget[] = [
  { category: '🛒 Groceries', monthlyLimit: 800 },
  { category: '🛍️ Shopping', monthlyLimit: 500 },
  { category: '☕ Dining', monthlyLimit: 300 },
  { category: '⛽ Transportation', monthlyLimit: 250 },
  { category: '💡 Utilities', monthlyLimit: 220 },
]

const STORAGE_KEY = 'craft-expenses-budgets'

function getStoredBudgets(): Budget[] {
  if (typeof window === 'undefined') return DEFAULT_BUDGETS
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return DEFAULT_BUDGETS
    }
  }
  return DEFAULT_BUDGETS
}

function storeBudgets(budgets: Budget[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets))
}

function ProgressBar({ progress }: { progress: BudgetProgressType }) {
  const statusColors = {
    safe: 'bg-[var(--success)]',
    warning: 'bg-[var(--warning)]',
    danger: 'bg-[var(--danger)]',
  }

  const cappedPercentage = Math.min(progress.percentage, 100)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span>{progress.category}</span>
        <span className="font-mono text-[var(--muted-foreground)]">
          {formatCurrency(progress.spent)} / {formatCurrency(progress.limit)}
        </span>
      </div>
      <div className="relative h-2 bg-[var(--muted)] rounded-full overflow-hidden">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-500',
            statusColors[progress.status]
          )}
          style={{ width: `${cappedPercentage}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
        <span>{formatPercentage(progress.percentage)} used</span>
        <span>
          {progress.percentage >= 100 
            ? `Over by ${formatCurrency(progress.spent - progress.limit)}`
            : `${formatCurrency(progress.limit - progress.spent)} remaining`
          }
        </span>
      </div>
    </div>
  )
}

function BudgetEditor({ 
  budgets, 
  onSave, 
  onClose 
}: { 
  budgets: Budget[]
  onSave: (budgets: Budget[]) => void
  onClose: () => void 
}) {
  const [editedBudgets, setEditedBudgets] = useState<Budget[]>(budgets)
  const [newCategory, setNewCategory] = useState('')
  const [newLimit, setNewLimit] = useState('')

  const handleUpdateLimit = (index: number, value: string) => {
    const newBudgets = [...editedBudgets]
    newBudgets[index].monthlyLimit = parseFloat(value) || 0
    setEditedBudgets(newBudgets)
  }

  const handleDelete = (index: number) => {
    const newBudgets = editedBudgets.filter((_, i) => i !== index)
    setEditedBudgets(newBudgets)
  }

  const handleAdd = () => {
    if (newCategory && newLimit) {
      setEditedBudgets([
        ...editedBudgets,
        { category: newCategory, monthlyLimit: parseFloat(newLimit) || 0 }
      ])
      setNewCategory('')
      setNewLimit('')
    }
  }

  const handleSave = () => {
    onSave(editedBudgets)
    onClose()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Edit Budgets</h4>
        <button onClick={onClose} className="p-1 hover:bg-[var(--muted)] rounded-xl">
          <X className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </div>

      <div className="space-y-3">
        {editedBudgets.map((budget, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="flex-1 text-sm">{budget.category}</span>
            <input
              type="number"
              value={budget.monthlyLimit}
              onChange={(e) => handleUpdateLimit(index, e.target.value)}
              className="w-24 px-2 py-1 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-xl font-mono"
            />
            <button 
              onClick={() => handleDelete(index)}
              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl"
            >
              <X className="w-4 h-4" strokeWidth={1.6} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
        <input
          type="text"
          placeholder="Category"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="flex-1 px-2 py-1 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-xl"
        />
        <input
          type="number"
          placeholder="Limit"
          value={newLimit}
          onChange={(e) => setNewLimit(e.target.value)}
          className="w-24 px-2 py-1 text-sm bg-[var(--muted)] border border-[var(--border)] rounded-xl font-mono"
        />
        <button 
          onClick={handleAdd}
          className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-950 rounded-xl"
        >
          <Plus className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </div>

      <button onClick={handleSave} className="btn-primary w-full flex items-center justify-center gap-2">
        <Check className="w-4 h-4" strokeWidth={1.6} />
        Save Budgets
      </button>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-5 w-40 bg-[var(--muted)] rounded mb-4" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full bg-[var(--muted)] rounded" />
            <div className="h-2 w-full bg-[var(--muted)] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BudgetProgress({ expenses, isLoading }: BudgetProgressProps) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setBudgets(getStoredBudgets())
  }, [])

  const handleSaveBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets)
    storeBudgets(newBudgets)
  }

  if (isLoading || !mounted) {
    return <LoadingSkeleton />
  }

  const progressData = calculateBudgetProgress(expenses, budgets)

  return (
    <div className="card animate-fade-in relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-[color:var(--accent)]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="flex items-center justify-between mb-4 relative">
        <h3 className="section-title mb-0 flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-[var(--accent)] to-[var(--accent-hover)] rounded-full"></span>
          Budget Goals
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 hover:bg-[color:var(--accent)]/10 hover:text-[var(--accent)] rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95"
          title="Edit budgets"
        >
          <Settings className="w-4 h-4" strokeWidth={1.6} />
        </button>
      </div>

      {isEditing ? (
        <BudgetEditor
          budgets={budgets}
          onSave={handleSaveBudgets}
          onClose={() => setIsEditing(false)}
        />
      ) : progressData.length > 0 ? (
        <div className="space-y-4">
          {progressData.map((progress) => (
            <ProgressBar key={progress.category} progress={progress} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-[var(--muted-foreground)]">
          <p className="mb-2">No budgets configured</p>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary text-sm"
          >
            Add Budget
          </button>
        </div>
      )}
    </div>
  )
}
