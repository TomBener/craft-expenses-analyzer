import type { CraftConfig } from './craftConfig'

export interface CraftCollection {
  id: string
  name?: string
}

function normalizeApiRoot(apiBaseUrl: string): string {
  const trimmed = apiBaseUrl.replace(/\/+$/, '')
  const cutPoints = ['/collections/', '/collections', '/documents', '/blocks', '/tasks']

  for (const marker of cutPoints) {
    const index = trimmed.indexOf(marker)
    if (index !== -1) {
      return trimmed.slice(0, index)
    }
  }

  return trimmed
}

export function buildCraftItemsUrl(
  config: CraftConfig,
  collectionIdOverride?: string
): string {
  const apiBaseUrl = config.apiBaseUrl
  const collectionId = collectionIdOverride ?? config.collectionId

  if (!apiBaseUrl) {
    return ''
  }

  try {
    const url = new URL(apiBaseUrl)
    const path = url.pathname.replace(/\/+$/, '')

    const hasCollectionInPath =
      /\/collections\/[^/]+(\/items)?$/.test(path) || path.includes('/collections/')

    if (!collectionId && !hasCollectionInPath) {
      throw new Error('Collection ID is required for Craft API.')
    }

    if (/\/collections\/[^/]+\/items$/.test(path)) {
      url.pathname = path
      return url.toString()
    }

    if (/\/collections\/[^/]+$/.test(path)) {
      url.pathname = `${path}/items`
      return url.toString()
    }

    if (path.includes('/collections/')) {
      url.pathname = path
      return url.toString()
    }

    url.pathname = `${path}/collections/${collectionId}/items`
    return url.toString()
  } catch {
    const trimmed = apiBaseUrl.replace(/\/+$/, '')
    const hasCollectionInPath =
      /\/collections\/[^/]+(\/items)?$/.test(trimmed) ||
      trimmed.includes('/collections/')

    if (!collectionId && !hasCollectionInPath) {
      throw new Error('Collection ID is required for Craft API.')
    }

    if (trimmed.endsWith('/items')) {
      return trimmed
    }

    if (/\/collections\/[^/]+$/.test(trimmed)) {
      return `${trimmed}/items`
    }

    if (trimmed.includes('/collections/')) {
      return trimmed
    }

    return `${trimmed}/collections/${collectionId}/items`
  }
}

export function buildCraftCollectionsUrl(config: CraftConfig): string {
  if (!config.apiBaseUrl) {
    return ''
  }

  const root = normalizeApiRoot(config.apiBaseUrl)
  if (!root) return ''

  const url = new URL(`${root}/collections`)
  url.searchParams.set('documentFilterMode', 'include')

  return url.toString()
}

export function selectCollectionId(collections: CraftCollection[]): string | null {
  if (!collections.length) return null

  const ranked = [...collections].sort((a, b) => {
    const scoreA = getCollectionScore(a.name)
    const scoreB = getCollectionScore(b.name)
    return scoreB - scoreA
  })

  return ranked[0]?.id ?? collections[0].id
}

function getCollectionScore(name?: string): number {
  if (!name) return 0
  const normalized = name.toLowerCase()

  if (normalized.includes('receipt')) return 4
  if (normalized.includes('expense')) return 3
  if (normalized.includes('transaction')) return 2
  if (normalized.includes('spend')) return 1

  return 0
}
