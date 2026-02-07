import type {
  DeleteRule,
  EmailPreview,
  FilterDiffResult,
  FilterEntry,
  HistoryEntry,
  Label,
  TriggerStatus,
} from '@/types'
import { mockDeleteRules, mockEmails, mockFilters, mockLabels } from './mockData'

/**
 * モックAPI（開発環境用）
 * google.script.run と同じインターフェースを提供
 */

// LocalStorageに保存するキー
const STORAGE_KEYS = {
  FILTERS: 'mock_filters',
  DELETE_RULES: 'mock_delete_rules',
  TRIGGER: 'mock_trigger',
}

// LocalStorageからデータを取得
function getStoredFilters(): FilterEntry[] {
  const stored = localStorage.getItem(STORAGE_KEYS.FILTERS)
  return stored ? JSON.parse(stored) : mockFilters
}

function getStoredDeleteRules(): DeleteRule[] {
  const stored = localStorage.getItem(STORAGE_KEYS.DELETE_RULES)
  return stored ? JSON.parse(stored) : mockDeleteRules
}

function getStoredTrigger(): TriggerStatus {
  const stored = localStorage.getItem(STORAGE_KEYS.TRIGGER)
  return stored ? JSON.parse(stored) : { enabled: false, hour: null }
}

// LocalStorageにデータを保存
function saveFiltersToStorage(filters: FilterEntry[]) {
  localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters))
}

function saveDeleteRulesToStorage(rules: DeleteRule[]) {
  localStorage.setItem(STORAGE_KEYS.DELETE_RULES, JSON.stringify(rules))
}

function saveTriggerToStorage(trigger: TriggerStatus) {
  localStorage.setItem(STORAGE_KEYS.TRIGGER, JSON.stringify(trigger))
}

// APIレスポンスを遅延させる（実際のAPI呼び出しをシミュレート）
function delay<T>(result: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(result), ms))
}

export const mockGasApi = {
  getFilters: async (): Promise<FilterEntry[]> => {
    console.log('[Mock API] getFilters')
    return delay(getStoredFilters())
  },

  saveFilters: async (filters: FilterEntry[]): Promise<{ success: boolean; count: number }> => {
    console.log('[Mock API] saveFilters', filters)
    saveFiltersToStorage(filters)
    return delay({ success: true, count: filters.length })
  },

  importFiltersXml: async (xml: string): Promise<{ success: boolean; count: number }> => {
    console.log('[Mock API] importFiltersXml', xml.length, 'chars')
    // XMLパースは省略（実装不要）
    return delay({ success: true, count: 0 })
  },

  applyFiltersToGmail: async (): Promise<{ success: boolean; applied: number; total: number }> => {
    console.log('[Mock API] applyFiltersToGmail')
    const filters = getStoredFilters()
    return delay({ success: true, applied: filters.length, total: filters.length })
  },

  searchEmails: async (query: string, max = 50): Promise<EmailPreview[]> => {
    console.log('[Mock API] searchEmails', query, max)
    // クエリでフィルタリング（簡易実装）
    const filtered = mockEmails.filter((email) => {
      const searchText = `${email.subject} ${email.from} ${email.snippet}`.toLowerCase()
      return searchText.includes(query.toLowerCase())
    })
    return delay(filtered.slice(0, max))
  },

  getLabels: async (): Promise<Label[]> => {
    console.log('[Mock API] getLabels')
    return delay(mockLabels)
  },

  getDeleteRules: async (): Promise<DeleteRule[]> => {
    console.log('[Mock API] getDeleteRules')
    return delay(getStoredDeleteRules())
  },

  saveDeleteRules: async (rules: DeleteRule[]): Promise<{ success: boolean }> => {
    console.log('[Mock API] saveDeleteRules', rules)
    saveDeleteRulesToStorage(rules)
    return delay({ success: true })
  },

  executeDeleteRule: async (labelName: string, days: number): Promise<{ deleted: number }> => {
    console.log('[Mock API] executeDeleteRule', labelName, days)
    // ランダムな削除数を返す
    const deleted = Math.floor(Math.random() * 50) + 1
    return delay({ deleted }, 1000)
  },

  getCurrentUser: async (): Promise<{ email: string }> => {
    console.log('[Mock API] getCurrentUser')
    return delay({ email: 'mock-user@example.com' })
  },

  getUnfilteredEmails: async (max = 50): Promise<EmailPreview[]> => {
    console.log('[Mock API] getUnfilteredEmails', max)
    return delay(mockEmails.slice(0, max))
  },

  getDataSpreadsheetUrl: async (): Promise<{ url: string }> => {
    console.log('[Mock API] getDataSpreadsheetUrl')
    return delay({ url: 'https://docs.google.com/spreadsheets/d/mock-spreadsheet-id' })
  },

  setup: async (): Promise<{ spreadsheetUrl: string; spreadsheetId: string }> => {
    console.log('[Mock API] setup')
    return delay({
      spreadsheetUrl: 'https://docs.google.com/spreadsheets/d/mock-spreadsheet-id',
      spreadsheetId: 'mock-spreadsheet-id',
    })
  },

  applyFilterDiff: async (dryRun = false): Promise<FilterDiffResult> => {
    console.log('[Mock API] applyFilterDiff', dryRun)
    return delay({
      created: dryRun ? 0 : 3,
      deleted: dryRun ? 0 : 1,
      errors: [],
      dryRun,
      wouldCreate: dryRun ? 3 : undefined,
      wouldDelete: dryRun ? 1 : undefined,
    })
  },

  applyToExistingMessages: async (filter: {
    criteria: FilterEntry['criteria']
    action: FilterEntry['action']
  }): Promise<{
    success: boolean
    count: number
    total?: number
    message?: string
    error?: string
    errors?: string[]
  }> => {
    console.log('[Mock API] applyToExistingMessages', filter)
    const count = Math.floor(Math.random() * 20) + 1
    return delay(
      {
        success: true,
        count,
        total: count,
        message: `${count}件のメールにラベルを適用しました`,
      },
      1500
    )
  },

  getTriggerStatus: async (): Promise<TriggerStatus> => {
    console.log('[Mock API] getTriggerStatus')
    return delay(getStoredTrigger())
  },

  setupDeleteTrigger: async (hour: number): Promise<{ success: boolean; hour: number }> => {
    console.log('[Mock API] setupDeleteTrigger', hour)
    saveTriggerToStorage({ enabled: true, hour })
    return delay({ success: true, hour })
  },

  removeDeleteTrigger: async (): Promise<{ success: boolean }> => {
    console.log('[Mock API] removeDeleteTrigger')
    saveTriggerToStorage({ enabled: false, hour: null })
    return delay({ success: true })
  },

  getDeleteHistory: async (limit = 50): Promise<HistoryEntry[]> => {
    console.log('[Mock API] getDeleteHistory', limit)
    const history: HistoryEntry[] = [
      {
        timestamp: '2026-02-07T09:00:00Z',
        action: 'DELETE',
        target: 'GitHub',
        details: '30日以上経過したメール 25件を削除',
      },
      {
        timestamp: '2026-02-06T09:00:00Z',
        action: 'DELETE',
        target: 'Newsletter',
        details: '7日以上経過したメール 42件を削除',
      },
    ]
    return delay(history.slice(0, limit))
  },
}
