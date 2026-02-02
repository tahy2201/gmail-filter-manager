import type {
  DeleteRule,
  EmailPreview,
  FilterDiffResult,
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
  saveFilters: (filters: FilterEntry[]) => void
  importFiltersXml: (xml: string) => void
  applyFiltersToGmail: () => void
  searchEmails: (query: string, max: number) => void
  getLabels: () => void
  getDeleteRules: () => void
  saveDeleteRules: (rules: DeleteRule[]) => void
  executeDeleteRule: (labelName: string, days: number) => void
  getCurrentUser: () => void
  getUnfilteredEmails: (max: number) => void
  getDataSpreadsheetUrl: () => void
  setup: () => void
  applyFilterDiff: (dryRun: boolean) => void
  getTriggerStatus: () => void
  setupDeleteTrigger: (hour: number) => void
  removeDeleteTrigger: () => void
  getDeleteHistory: (limit: number) => void
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

  saveFilters: (filters: FilterEntry[]): Promise<{ success: boolean; count: number }> =>
    runGasFunction('saveFilters', filters),

  importFiltersXml: (xml: string): Promise<{ success: boolean; count: number }> =>
    runGasFunction('importFiltersXml', xml),

  applyFiltersToGmail: (): Promise<{ success: boolean; applied: number; total: number }> =>
    runGasFunction('applyFiltersToGmail'),

  searchEmails: (query: string, max = 50): Promise<EmailPreview[]> =>
    runGasFunction('searchEmails', query, max),

  getLabels: (): Promise<Label[]> => runGasFunction('getLabels'),

  getDeleteRules: (): Promise<DeleteRule[]> => runGasFunction('getDeleteRules'),

  saveDeleteRules: (rules: DeleteRule[]): Promise<{ success: boolean }> =>
    runGasFunction('saveDeleteRules', rules),

  executeDeleteRule: (labelName: string, days: number): Promise<{ deleted: number }> =>
    runGasFunction('executeDeleteRule', labelName, days),

  getCurrentUser: (): Promise<{ email: string }> => runGasFunction('getCurrentUser'),

  getUnfilteredEmails: (max = 50): Promise<EmailPreview[]> =>
    runGasFunction('getUnfilteredEmails', max),

  getDataSpreadsheetUrl: (): Promise<{ url: string }> =>
    runGasFunction('getDataSpreadsheetUrl'),

  setup: (): Promise<{ spreadsheetUrl: string; spreadsheetId: string }> =>
    runGasFunction('setup'),

  applyFilterDiff: (dryRun = false): Promise<FilterDiffResult> =>
    runGasFunction('applyFilterDiff', dryRun),

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
}
