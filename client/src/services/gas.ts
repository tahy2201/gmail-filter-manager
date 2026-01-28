/**
 * GAS API クライアント
 */

import type { FilterEntry, Label, EmailPreview, DeleteRule } from '../types';

// GAS の google.script.run の型定義
declare const google: {
  script: {
    run: {
      withSuccessHandler: (callback: (result: unknown) => void) => GasRunner;
      withFailureHandler: (callback: (error: Error) => void) => GasRunner;
    };
  };
};

interface GasRunner {
  withSuccessHandler: (callback: (result: unknown) => void) => GasRunner;
  withFailureHandler: (callback: (error: Error) => void) => GasRunner;
  getFilters: () => void;
  saveFilters: (filters: FilterEntry[]) => void;
  importFiltersXml: (xml: string) => void;
  applyFiltersToGmail: () => void;
  searchEmails: (query: string, max: number) => void;
  getLabels: () => void;
  getDeleteRules: () => void;
  saveDeleteRules: (rules: DeleteRule[]) => void;
  executeDeleteRule: (labelName: string, days: number) => void;
  getCurrentUser: () => void;
  getUnfilteredEmails: (max: number) => void;
  getDataSpreadsheetUrl: () => void;
  setup: () => void;
}

/**
 * GAS関数を Promise でラップ
 */
function runGasFunction<T>(functionName: string, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    const runner = google.script.run
      .withSuccessHandler((result) => resolve(result as T))
      .withFailureHandler(reject) as unknown as Record<string, (...args: unknown[]) => void>;
    runner[functionName](...args);
  });
}

export const gasApi = {
  /** フィルタ一覧を取得 */
  getFilters: (): Promise<FilterEntry[]> => runGasFunction('getFilters'),

  /** フィルタを保存 */
  saveFilters: (filters: FilterEntry[]): Promise<{ success: boolean; count: number }> =>
    runGasFunction('saveFilters', filters),

  /** XML からフィルタをインポート */
  importFiltersXml: (xml: string): Promise<{ success: boolean; count: number }> =>
    runGasFunction('importFiltersXml', xml),

  /** Gmail にフィルタを適用 */
  applyFiltersToGmail: (): Promise<{ success: boolean; applied: number; total: number }> =>
    runGasFunction('applyFiltersToGmail'),

  /** メール検索 */
  searchEmails: (query: string, max = 50): Promise<EmailPreview[]> =>
    runGasFunction('searchEmails', query, max),

  /** ラベル一覧を取得 */
  getLabels: (): Promise<Label[]> => runGasFunction('getLabels'),

  /** 削除ルール一覧を取得 */
  getDeleteRules: (): Promise<DeleteRule[]> => runGasFunction('getDeleteRules'),

  /** 削除ルールを保存 */
  saveDeleteRules: (rules: DeleteRule[]): Promise<{ success: boolean }> =>
    runGasFunction('saveDeleteRules', rules),

  /** 削除ルールを実行 */
  executeDeleteRule: (labelName: string, days: number): Promise<{ deleted: number }> =>
    runGasFunction('executeDeleteRule', labelName, days),

  /** 現在のユーザー情報を取得 */
  getCurrentUser: (): Promise<{ email: string }> => runGasFunction('getCurrentUser'),

  /** フィルタ外メールを取得 */
  getUnfilteredEmails: (max = 50): Promise<EmailPreview[]> =>
    runGasFunction('getUnfilteredEmails', max),

  /** スプレッドシートURLを取得 */
  getDataSpreadsheetUrl: (): Promise<{ url: string }> =>
    runGasFunction('getDataSpreadsheetUrl'),

  /** 初期セットアップ */
  setup: (): Promise<{ spreadsheetUrl: string; spreadsheetId: string }> =>
    runGasFunction('setup'),
};
