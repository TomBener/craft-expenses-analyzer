'use client'

import { useState, useEffect } from 'react'
import { X, Save, HelpCircle } from 'lucide-react'
import {
  buildCraftCollectionsUrl,
  buildCraftItemsUrl,
  selectCollectionId,
} from '@/lib/craftApi'
import {
  CraftConfig,
  DEFAULT_CONFIG,
  clearCraftConfig,
  getCraftConfig,
  normalizeCraftConfig,
  saveCraftConfig,
} from '@/lib/craftConfig'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: CraftConfig) => void
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [config, setConfig] = useState<CraftConfig>(DEFAULT_CONFIG)
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error' | 'testing' | null; message: string }>({ status: null, message: '' })

  useEffect(() => {
    if (isOpen) {
      const saved = getCraftConfig()
      if (saved) {
        setConfig(saved)
      } else {
        setConfig(DEFAULT_CONFIG)
      }
      // Reset test result when modal opens
      setTestResult({ status: null, message: '' })
    }
  }, [isOpen])

  const handleTestConnection = async () => {
    setTestResult({ status: 'testing', message: 'Testing connection...' })

    try {
      const normalized = normalizeCraftConfig(config)
      if (!normalized.apiBaseUrl) {
        throw new Error('API Base URL is required.')
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }

      if (normalized.apiKey) {
        headers['Authorization'] = `Bearer ${normalized.apiKey}`
      }

      let collectionId = normalized.collectionId
      let collectionHint = ''

      if (!collectionId) {
        const collectionsUrl = buildCraftCollectionsUrl(normalized)
        if (!collectionsUrl) {
          throw new Error('Collection ID is required or a valid API Base URL is needed to discover collections.')
        }

        const collectionsResponse = await fetch(collectionsUrl, { headers })
        if (!collectionsResponse.ok) {
          throw new Error(
            `Unable to list collections (${collectionsResponse.status}). Provide a Collection ID or check the API Base URL.`
          )
        }

        const collectionsData = await collectionsResponse.json()
        collectionId = selectCollectionId(collectionsData.items || [])

        if (!collectionId) {
          throw new Error('No collections found. Provide a Collection ID or check API access.')
        }

        const selected = (collectionsData.items || []).find(
          (item: { id?: string; name?: string }) => item.id === collectionId
        )
        if (selected?.name) {
          collectionHint = `Auto-selected collection: ${selected.name}`
        }
      }

      const testUrl = buildCraftItemsUrl(normalized, collectionId)
      const response = await fetch(testUrl, { headers })

      if (response.ok) {
        const data = await response.json()
        setTestResult({
          status: 'success',
          message: `✅ Success! Found ${data.items?.length || 0} items.\nURL: ${testUrl}${collectionHint ? `\n${collectionHint}` : ''}`
        })
      } else {
        setTestResult({
          status: 'error',
          message: `❌ Error ${response.status}: ${response.statusText}\n\nURL tried: ${testUrl}\n\n${response.status === 401 ? 'If Access Mode is API Key, verify the key. If Access Mode is Public, leave API Key empty.' : response.status === 404 ? 'Check that Collection ID is correct and exists.' : 'Check your configuration.'}`
        })
      }
    } catch (err) {
      setTestResult({
        status: 'error',
        message: `❌ ${err instanceof Error ? err.message : 'Connection failed'}`
      })
    }
  }

  const handleSave = () => {
    const normalized = normalizeCraftConfig(config)
    saveCraftConfig(normalized)
    onSave(normalized)
    onClose()
  }

  const handleClear = () => {
    clearCraftConfig()
    setConfig(DEFAULT_CONFIG)
    onSave(DEFAULT_CONFIG)
    setTestResult({ status: null, message: '' })
  }

  const handleUseMockData = () => {
    clearCraftConfig()
    onClose()
    window.location.reload()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg animate-fade-in">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-[32px] shadow-[0_30px_80px_rgba(15,23,42,0.25)] max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in relative">
        {/* Gradient background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[color:var(--accent)]/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div>
            <h2 className="text-2xl font-black tracking-tight gradient-text">
              Craft API Settings
            </h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1 font-medium flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--accent)]"></span>
              Connect to your own Craft expenses data
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[color:var(--accent)]/10 hover:text-[var(--accent)] rounded-2xl transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5" strokeWidth={1.6} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Help Banner */}
          <div className="bg-[var(--muted)] border border-[var(--border)] rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <HelpCircle className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" strokeWidth={1.6} />
              <div className="text-sm text-[var(--foreground)]">
                <p className="font-semibold mb-2">How to get your Craft API credentials:</p>
                <ol className="list-decimal list-inside space-y-1.5 text-[var(--muted-foreground)]">
                  <li>Open Craft</li>
                  <li>Click <strong>Imagine</strong> in the left sidebar</li>
                  <li>Click the plus icon to create a "New API Connection"</li>
                  <li>Copy the API URL and optional API Key if required</li>
                </ol>
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  📖 <a href="https://support.craft.do/hc/en-us/articles/23702897811612-Craft-API" target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--accent)]">
                    Learn more about Craft API
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* API Base URL */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              API Base URL
              <span className="text-xs font-normal text-[var(--muted-foreground)] ml-2">
                (Required)
              </span>
            </label>
            <input
              type="text"
              value={config.apiBaseUrl}
              onChange={(e) => setConfig({ ...config, apiBaseUrl: e.target.value })}
              placeholder="https://connect.craft.do/links/AbCd1234XyZ/api/v1"
              className="w-full px-4 py-3 bg-[color:var(--muted)]/70 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono text-sm"
            />
          </div>

          {/* API Key (Optional) */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              API Key
              <span className="text-xs font-normal text-[var(--muted-foreground)] ml-2">
                (Optional - required if Access Mode is API Key)
              </span>
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="Leave empty when Access Mode is Public"
              className="w-full px-4 py-3 bg-[color:var(--muted)]/70 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono text-sm"
            />
          </div>

          {/* Collection ID */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Collection ID
            </label>
            <input
              type="text"
              value={config.collectionId}
              onChange={(e) => setConfig({ ...config, collectionId: e.target.value })}
              placeholder="12345678-ABCD-1234-EFGH-567890ABCDEF"
              className="w-full px-4 py-3 bg-[color:var(--muted)]/70 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-mono text-sm"
            />
            <p className="text-xs text-[var(--muted-foreground)] mt-1.5">
              💡 <strong>How to find Collection ID:</strong> In Craft, open your document with the collection → Right click the collection → Click As → Deeplink → The ID is in the URL after <code className="bg-[var(--muted)] px-1 rounded">blockId</code>.
            </p>
          </div>


          {/* Test Connection Button */}
          <div>
            <button
              onClick={handleTestConnection}
              disabled={!config.apiBaseUrl || testResult.status === 'testing'}
              className="w-full px-4 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:bg-gray-400 disabled:cursor-not-allowed text-[var(--accent-foreground)] rounded-2xl transition-colors font-semibold"
            >
              {testResult.status === 'testing' ? 'Testing...' : '🔍 Test Connection'}
            </button>
          </div>

          {/* Test Result Display */}
          {testResult.status && testResult.status !== 'testing' && (
            <div className={`p-4 rounded-2xl border ${
              testResult.status === 'success'
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
            }`}>
              <pre className={`text-sm whitespace-pre-wrap font-mono ${
                testResult.status === 'success'
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }`}>
                {testResult.message}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-6 border-t border-[var(--border)] gap-3">
          <button
            onClick={handleUseMockData}
            className="btn-secondary px-4 py-2.5"
          >
            Use Demo Data
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="btn-secondary px-4 py-2.5"
            >
              Clear
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5"
            >
              <Save className="w-4 h-4" strokeWidth={1.6} />
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
