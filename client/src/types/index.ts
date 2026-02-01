export interface FilterCriteria {
  from?: string
  to?: string
  subject?: string
  hasTheWord?: string
  doesNotHaveTheWord?: string
}

export interface FilterAction {
  label?: string
  shouldArchive?: boolean
  shouldMarkAsRead?: boolean
  shouldNeverSpam?: boolean
  shouldNeverMarkAsImportant?: boolean
  forwardTo?: string
}

export interface FilterEntry {
  id: string
  criteria: FilterCriteria
  action: FilterAction
}

export interface Label {
  id: string
  name: string
  type: 'system' | 'user'
}

export interface EmailPreview {
  id: string
  threadId: string
  subject: string
  from: string
  date: string
  snippet: string
}

export interface DeleteRule {
  labelName: string
  delayDays: number
  enabled: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface FilterDiffItem {
  gmailId?: string
  from?: string
  to?: string
  subject?: string
  hasTheWord?: string
  label?: string
}

export interface FilterDiffResult {
  created: number
  deleted: number
  errors: Array<{
    action: 'create' | 'delete'
    filter: FilterDiffItem
    error: string
  }>
  dryRun?: boolean
  wouldCreate?: number
  wouldDelete?: number
}

export interface LabelGroupData {
  labelName: string
  filters: FilterEntry[]
  deleteRule: DeleteRule | null
}

export interface TriggerStatus {
  enabled: boolean
  hour: number | null
}

export interface HistoryEntry {
  timestamp: string
  action: string
  target: string
  details: string
}
