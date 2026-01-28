/** フィルタの条件 */
export interface FilterCriteria {
  from?: string;
  to?: string;
  subject?: string;
  hasTheWord?: string;
  doesNotHaveTheWord?: string;
}

/** フィルタのアクション */
export interface FilterAction {
  label?: string;
  shouldArchive?: boolean;
  shouldMarkAsRead?: boolean;
  shouldNeverSpam?: boolean;
  shouldNeverMarkAsImportant?: boolean;
  forwardTo?: string;
}

/** フィルタエントリー */
export interface FilterEntry {
  id: string;
  criteria: FilterCriteria;
  action: FilterAction;
}

/** Gmailラベル */
export interface Label {
  id: string;
  name: string;
  type: 'system' | 'user';
}

/** メールプレビュー */
export interface EmailPreview {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

/** 削除ルール */
export interface DeleteRule {
  labelName: string;
  delayDays: number;
  enabled: boolean;
}

/** API レスポンス */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
