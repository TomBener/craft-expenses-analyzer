export interface CraftConfig {
  apiBaseUrl: string
  apiKey: string
  collectionId: string
}

export const DEFAULT_CONFIG: CraftConfig = {
  apiBaseUrl: '',
  apiKey: '',
  collectionId: '',
}

const STORAGE_KEY = 'craft-api-config'

export function normalizeCraftConfig(config: CraftConfig): CraftConfig {
  const apiBaseUrl = config.apiBaseUrl.trim().replace(/\/+$/, '')
  const apiKey = config.apiKey.trim().replace(/^bearer\s+/i, '')
  const collectionId = config.collectionId.trim()

  return { apiBaseUrl, apiKey, collectionId }
}

export function getCraftConfig(): CraftConfig | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return null

  try {
    const parsed = JSON.parse(stored) as Partial<CraftConfig>
    return normalizeCraftConfig({
      apiBaseUrl: parsed.apiBaseUrl ?? '',
      apiKey: parsed.apiKey ?? '',
      collectionId: parsed.collectionId ?? '',
    })
  } catch {
    return null
  }
}

export function saveCraftConfig(config: CraftConfig) {
  if (typeof window === 'undefined') return
  const normalized = normalizeCraftConfig(config)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
}

export function clearCraftConfig() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
