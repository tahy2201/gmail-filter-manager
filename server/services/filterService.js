/**
 * Gmail Filter Service
 * Gmail API を直接使用してフィルタの CRUD を担当
 */

// 既存メール適用の定数
const MAX_MESSAGES_PER_PAGE = 500
const MAX_MESSAGES_TO_PROCESS = 1000
const BATCH_MODIFY_SIZE = 100

/**
 * Gmail から既存フィルタを取得
 * @returns {Array} Gmail フィルタ一覧（生の Gmail API 形式）
 */
function getGmailFilters() {
  const response = Gmail.Users.Settings.Filters.list('me')
  return response.filter || []
}

/**
 * ラベル名 ⇔ ID のマップを構築
 * @returns {Object} { nameToId: Object, idToName: Object }
 */
function buildLabelMap() {
  const labels = Gmail.Users.Labels.list('me').labels || []
  const nameToId = {}
  const idToName = {}

  for (const label of labels) {
    nameToId[label.name] = label.id
    idToName[label.id] = label.name
  }

  return { nameToId, idToName }
}

/**
 * Gmail フィルタをアプリ形式に変換
 * @param {Object} gmailFilter - Gmail API フィルタ
 * @param {Object} idToName - ラベルID→名前マップ
 * @returns {Object} アプリ形式のフィルタ
 */
function normalizeGmailFilter(gmailFilter, idToName) {
  const criteria = gmailFilter.criteria || {}
  const action = gmailFilter.action || {}

  // addLabelIds からラベル名・IDを取得
  let labelName = ''
  let userLabelId = ''
  if (action.addLabelIds && action.addLabelIds.length > 0) {
    for (const lid of action.addLabelIds) {
      if (idToName[lid] && !lid.startsWith('CATEGORY_')) {
        labelName = idToName[lid]
        userLabelId = lid
        break
      }
    }
  }

  // removeLabelIds から各フラグを判定
  const removeLabelIds = action.removeLabelIds || []
  const shouldArchive = removeLabelIds.includes('INBOX')
  const shouldMarkAsRead = removeLabelIds.includes('UNREAD')
  const shouldNeverSpam = removeLabelIds.includes('SPAM')

  return {
    id: gmailFilter.id,
    criteria: {
      from: criteria.from || '',
      to: criteria.to || '',
      subject: criteria.subject || '',
      hasTheWord: criteria.query || '',
      doesNotHaveTheWord: criteria.negatedQuery || ''
    },
    action: {
      label: labelName,
      labelId: userLabelId,
      shouldArchive: shouldArchive,
      shouldMarkAsRead: shouldMarkAsRead,
      shouldNeverSpam: shouldNeverSpam,
      forwardTo: action.forward || ''
    }
  }
}

/**
 * フィルタの criteria が有効かチェック
 * @param {Object} gmailFilter - Gmail API 形式のフィルタ
 * @returns {boolean} 有効な場合 true
 */
function hasValidCriteria(gmailFilter) {
  const criteria = gmailFilter.criteria
  return Object.keys(criteria).length > 0 && Object.values(criteria).some((v) => v)
}

/**
 * Gmail 全フィルタを取得しアプリ形式で返す
 * @returns {Array} アプリ形式のフィルタ一覧
 */
function getFiltersFromGmail() {
  const gmailFilters = getGmailFilters()
  const { idToName } = buildLabelMap()

  return gmailFilters.map((f) => normalizeGmailFilter(f, idToName))
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
  if (filter.action.shouldNeverSpam) {
    gmailFilter.action.removeLabelIds = gmailFilter.action.removeLabelIds || []
    gmailFilter.action.removeLabelIds.push('SPAM')
  }
  if (filter.action.forwardTo) {
    gmailFilter.action.forward = filter.action.forwardTo
  }

  return gmailFilter
}

/**
 * Gmail にフィルタを作成
 * @param {Object} filterEntry - アプリ形式のフィルタ
 * @returns {Object} 作成されたフィルタ（Gmail ID 付きアプリ形式）
 */
function createFilterInGmail(filterEntry) {
  const gmailFilter = buildGmailFilter(filterEntry)

  if (!hasValidCriteria(gmailFilter)) {
    throw new Error('フィルタ条件が空です')
  }

  const created = Gmail.Users.Settings.Filters.create(gmailFilter, 'me')
  const { idToName } = buildLabelMap()

  addHistory(
    'CREATE_FILTER',
    filterEntry.action.label || '(ラベルなし)',
    `Created filter ${created.id}`
  )

  return normalizeGmailFilter(created, idToName)
}

/**
 * Gmail のフィルタを更新（create → delete の順で実行）
 * Gmail API にはフィルタの update がないため、新フィルタを先に作成してから旧フィルタを削除する。
 * create を先にすることで、エラー時にフィルタが失われるリスクを回避する。
 * @param {string} filterId - 既存の Gmail フィルタ ID
 * @param {Object} filterEntry - 更新後のアプリ形式フィルタ
 * @returns {Object} 更新されたフィルタ（新 Gmail ID 付きアプリ形式）
 */
function updateFilterInGmail(filterId, filterEntry) {
  const gmailFilter = buildGmailFilter(filterEntry)

  if (!hasValidCriteria(gmailFilter)) {
    throw new Error('フィルタ条件が空です')
  }

  // 先に新フィルタを作成（失敗しても旧フィルタは残る）
  const created = Gmail.Users.Settings.Filters.create(gmailFilter, 'me')

  // 新フィルタ作成成功後に旧フィルタを削除
  try {
    Gmail.Users.Settings.Filters.remove('me', filterId)
  } catch (e) {
    // 旧フィルタ削除失敗は警告のみ（新フィルタは作成済みなので致命的ではない）
    console.warn(`旧フィルタの削除に失敗（重複が残る可能性あり）: ${filterId}`, e)
  }

  const { idToName } = buildLabelMap()

  addHistory(
    'UPDATE_FILTER',
    filterEntry.action.label || '(ラベルなし)',
    `Updated filter ${filterId} → ${created.id}`
  )

  return normalizeGmailFilter(created, idToName)
}

/**
 * Gmail からフィルタを削除
 * @param {string} filterId - Gmail フィルタ ID
 * @returns {Object} 削除結果
 */
function deleteFilterFromGmail(filterId) {
  Gmail.Users.Settings.Filters.remove('me', filterId)
  addHistory('DELETE_FILTER', '(ラベルなし)', `Deleted filter ${filterId}`)
  return { success: true }
}

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
