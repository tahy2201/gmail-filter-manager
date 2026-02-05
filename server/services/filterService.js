/**
 * Gmail Filter Service
 * フィルタの読み込み、保存、Gmail API への適用を担当
 */

const FILTERS_SHEET = 'Filters'

/**
 * スプレッドシートからフィルタを読み込む
 * @returns {Array} フィルタ一覧
 */
function getFiltersFromSpreadsheet() {
  const sheet = getSheet(FILTERS_SHEET)
  const lastRow = sheet.getLastRow()

  if (lastRow <= 1) {
    return []
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 10).getValues()
  return rowsToFilters(data)
}

/**
 * フィルタをスプレッドシートに保存
 * @param {Array} filters - フィルタ一覧
 * @returns {Object} 保存結果
 */
function saveFiltersToSpreadsheet(filters) {
  const sheet = getSheet(FILTERS_SHEET)

  // 既存データをクリア（ヘッダー以外）
  const lastRow = sheet.getLastRow()
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 10).clearContent()
  }

  // 新しいデータを書き込み
  if (filters.length > 0) {
    const data = filtersToRows(filters)
    sheet.getRange(2, 1, data.length, 10).setValues(data)
  }

  addHistory('SAVE_FILTERS', 'Filters', `Saved ${filters.length} filters`)

  return { success: true, count: filters.length }
}

/**
 * XML からフィルタをインポート
 * @param {string} xml - XML 文字列
 * @returns {Object} インポート結果
 */
function importFiltersFromXml(xml) {
  const filters = parseFiltersXml(xml)
  return saveFiltersToSpreadsheet(filters)
}

/**
 * フィルタを Gmail に適用
 * @returns {Object} 適用結果
 */
function applyFilters() {
  const filters = getFiltersFromSpreadsheet()
  let applied = 0

  for (const filter of filters) {
    try {
      const gmailFilter = buildGmailFilter(filter)
      Gmail.Users.Settings.Filters.create(gmailFilter, 'me')
      applied++
    } catch (e) {
      console.error(`Failed to apply filter ${filter.id}:`, e)
    }
  }

  addHistory('APPLY_FILTERS', 'Gmail', `Applied ${applied}/${filters.length} filters`)

  return { success: true, applied: applied, total: filters.length }
}

/**
 * FilterEntry を Gmail API 形式に変換
 * @param {Object} filter - FilterEntry
 * @returns {Object} Gmail API フィルタ形式
 */
function buildGmailFilter(filter) {
  const gmailFilter = {
    criteria: {},
    action: {}
  }

  // Criteria
  if (filter.criteria.from) {
    gmailFilter.criteria.from = filter.criteria.from
  }
  if (filter.criteria.to) {
    gmailFilter.criteria.to = filter.criteria.to
  }
  if (filter.criteria.subject) {
    gmailFilter.criteria.subject = filter.criteria.subject
  }
  if (filter.criteria.hasTheWord) {
    gmailFilter.criteria.query = filter.criteria.hasTheWord
  }
  if (filter.criteria.doesNotHaveTheWord) {
    gmailFilter.criteria.negatedQuery = filter.criteria.doesNotHaveTheWord
  }

  // Action
  if (filter.action.label) {
    const label = getOrCreateLabel(filter.action.label)
    gmailFilter.action.addLabelIds = [label.id]
  }
  if (filter.action.shouldArchive) {
    gmailFilter.action.removeLabelIds = gmailFilter.action.removeLabelIds || []
    gmailFilter.action.removeLabelIds.push('INBOX')
  }
  if (filter.action.shouldMarkAsRead) {
    gmailFilter.action.removeLabelIds = gmailFilter.action.removeLabelIds || []
    gmailFilter.action.removeLabelIds.push('UNREAD')
  }
  if (filter.action.forwardTo) {
    gmailFilter.action.forward = filter.action.forwardTo
  }

  return gmailFilter
}

// 既存メール適用の定数
const MAX_MESSAGES_PER_PAGE = 500
const MAX_MESSAGES_TO_PROCESS = 1000
const BATCH_MODIFY_SIZE = 100

/**
 * 既存の一致するメールにフィルタアクションを適用
 * @param {Object} filter - フィルタ (criteria と action を含む)
 * @returns {Object} 適用結果 { success, count, errors }
 */
function applyFilterToExistingMessages(filter) {
  const query = buildSearchQuery(filter.criteria)

  if (!query) {
    return { success: false, count: 0, error: 'No search criteria specified' }
  }

  // ラベルが指定されていない場合は何もしない
  if (!filter.action.label) {
    return { success: true, count: 0, message: 'No label to apply' }
  }

  // ラベルを取得または作成
  const label = getOrCreateLabel(filter.action.label)

  // 一致するメッセージを検索
  const messages = []
  let pageToken = null

  try {
    do {
      const response = Gmail.Users.Messages.list('me', {
        q: query,
        maxResults: MAX_MESSAGES_PER_PAGE,
        pageToken: pageToken
      })

      if (response.messages) {
        messages.push(...response.messages)
      }

      pageToken = response.nextPageToken
    } while (pageToken && messages.length < MAX_MESSAGES_TO_PROCESS)
  } catch (e) {
    return { success: false, count: 0, error: `Search failed: ${e.message}` }
  }

  if (messages.length === 0) {
    return { success: true, count: 0, message: 'No matching messages found' }
  }

  // メッセージにラベルを適用
  let appliedCount = 0
  const errors = []

  // バッチ処理用のリクエストを構築
  const addLabelIds = [label.id]
  const removeLabelIds = []

  if (filter.action.shouldArchive) {
    removeLabelIds.push('INBOX')
  }
  if (filter.action.shouldMarkAsRead) {
    removeLabelIds.push('UNREAD')
  }

  // バッチ修正
  for (let i = 0; i < messages.length; i += BATCH_MODIFY_SIZE) {
    const batch = messages.slice(i, i + BATCH_MODIFY_SIZE)
    const messageIds = batch.map((m) => m.id)

    try {
      Gmail.Users.Messages.batchModify(
        {
          ids: messageIds,
          addLabelIds: addLabelIds,
          removeLabelIds: removeLabelIds.length > 0 ? removeLabelIds : undefined
        },
        'me'
      )

      appliedCount += batch.length
    } catch (e) {
      errors.push(`Batch ${Math.floor(i / BATCH_MODIFY_SIZE) + 1} failed: ${e.message}`)
    }
  }

  addHistory(
    'APPLY_TO_EXISTING',
    filter.action.label,
    `Applied to ${appliedCount}/${messages.length} messages`
  )

  return {
    success: errors.length === 0,
    count: appliedCount,
    total: messages.length,
    errors: errors
  }
}
