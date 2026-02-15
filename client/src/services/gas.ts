import type {
  DeleteRule,
  EmailPreview,
  FilterEntry,
  HistoryEntry,
  Label,
  TriggerStatus,
} from '../types'

declare const google: {
  script: {
    run: {
      withSuccessHandler: (callback: (result: unknown) => void) => GasRunner
      withFailureHandler: (callback: (error: Error) => void) => GasRunner
    }
  }
}

interface GasRunner {
  withSuccessHandler: (callback: (result: unknown) => void) => GasRunner
  withFailureHandler: (callback: (error: Error) => void) => GasRunner
  getFilters: () => void
  createFilter: (filterEntry: Omit<FilterEntry, 'id'>) => void
  updateFilter: (filterId: string, filterEntry: Omit<FilterEntry, 'id'>) => void
  deleteFilter: (filterId: string) => void
  searchEmails: (query: string, max: number) => void
  getLabels: () => void
  getDeleteRules: () => void
  saveDeleteRules: (rules: DeleteRule[]) => void
  executeDeleteRule: (labelId: string, days: number) => void
  getCurrentUser: () => void
  getUnfilteredEmails: (max: number) => void
  getDataSpreadsheetUrl: () => void
  setup: () => void
  getTriggerStatus: () => void
  setupDeleteTrigger: (hour: number) => void
  removeDeleteTrigger: () => void
  getDeleteHistory: (limit: number) => void
  updateSpreadsheetReference: (spreadsheetId: string) => void
  createLabel: (labelName: string) => void
  renameLabel: (labelId: string, newName: string) => void
  deleteLabel: (labelId: string) => void
  checkLabelDeletionImpact: (labelId: string) => void
  updateLabelColor: (labelId: string, backgroundColor: string, textColor: string) => void
}

function runGasFunction<T>(
  functionName: string,
  ...args: unknown[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const runner = google.script.run
      .withSuccessHandler((result) => resolve(result as T))
      .withFailureHandler(reject) as unknown as Record<
      string,
      (...args: unknown[]) => void
    >
    runner[functionName](...args)
  })
}

export const gasApi = {
  getFilters: (): Promise<FilterEntry[]> => runGasFunction('getFilters'),

  createFilter: (filter: Omit<FilterEntry, 'id'>): Promise<FilterEntry> =>
    runGasFunction('createFilter', filter),

  updateFilter: (filterId: string, filter: Omit<FilterEntry, 'id'>): Promise<FilterEntry> =>
    runGasFunction('updateFilter', filterId, filter),

  deleteFilter: (filterId: string): Promise<{ success: boolean }> =>
    runGasFunction('deleteFilter', filterId),

  searchEmails: (query: string, max = 50): Promise<EmailPreview[]> =>
    runGasFunction('searchEmails', query, max),

  getLabels: (): Promise<Label[]> => runGasFunction('getLabels'),

  getDeleteRules: (): Promise<DeleteRule[]> => runGasFunction('getDeleteRules'),

  saveDeleteRules: (rules: DeleteRule[]): Promise<{ success: boolean }> =>
    runGasFunction('saveDeleteRules', rules),

  executeDeleteRule: (labelId: string, days: number): Promise<{ deleted: number }> =>
    runGasFunction('executeDeleteRule', labelId, days),

  getCurrentUser: (): Promise<{ email: string }> => runGasFunction('getCurrentUser'),

  getUnfilteredEmails: (max = 50): Promise<EmailPreview[]> =>
    runGasFunction('getUnfilteredEmails', max),

  getDataSpreadsheetUrl: (): Promise<{ url: string }> =>
    runGasFunction('getDataSpreadsheetUrl'),

  setup: (): Promise<{ spreadsheetUrl: string; spreadsheetId: string }> =>
    runGasFunction('setup'),

  applyToExistingMessages: (filter: {
    criteria: FilterEntry['criteria']
    action: FilterEntry['action']
  }): Promise<{
    success: boolean
    count: number
    total?: number
    message?: string
    error?: string
    errors?: string[]
  }> => runGasFunction('applyToExistingMessages', filter),

  getTriggerStatus: (): Promise<TriggerStatus> => runGasFunction('getTriggerStatus'),

  setupDeleteTrigger: (hour: number): Promise<{ success: boolean; hour: number }> =>
    runGasFunction('setupDeleteTrigger', hour),

  removeDeleteTrigger: (): Promise<{ success: boolean }> =>
    runGasFunction('removeDeleteTrigger'),

  getDeleteHistory: (limit = 50): Promise<HistoryEntry[]> =>
    runGasFunction('getDeleteHistory', limit),

  updateSpreadsheetReference: (spreadsheetId: string): Promise<{ url: string }> =>
    runGasFunction('updateSpreadsheetReference', spreadsheetId),

  createLabel: (labelName: string): Promise<Label> =>
    runGasFunction('createLabel', labelName),

  renameLabel: (labelId: string, newName: string): Promise<Label> =>
    runGasFunction('renameLabel', labelId, newName),

  deleteLabel: (labelId: string): Promise<{ success: boolean }> =>
    runGasFunction('deleteLabel', labelId),

  checkLabelDeletionImpact: (labelId: string): Promise<{ filtersCount: number; deleteRulesCount: number; childLabelsCount: number }> =>
    runGasFunction('checkLabelDeletionImpact', labelId),

  updateLabelColor: (labelId: string, backgroundColor: string, textColor: string): Promise<Label> =>
    runGasFunction('updateLabelColor', labelId, backgroundColor, textColor),
}
