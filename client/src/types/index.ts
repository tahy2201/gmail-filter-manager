export interface FilterCriteria {
  from?: string
  to?: string
  subject?: string
  hasTheWord?: string
  doesNotHaveTheWord?: string
}

export interface FilterAction {
  label?: string
  labelId?: string
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

export interface LabelColor {
  backgroundColor: string
  textColor: string
}

export interface Label {
  id: string
  name: string
  type: 'system' | 'user'
  color?: LabelColor | null
}

export interface DeleteRule {
  labelId: string
  labelName: string
  delayDays: number
  enabled: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface LabelGroupData {
  labelId: string
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
