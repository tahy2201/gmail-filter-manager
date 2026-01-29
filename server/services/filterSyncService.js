/**
 * Gmail Filter Sync Service
 * Gmail との差分同期機能を担当
 *
 * 依存: filterService.js の関数を使用
 *   - getFiltersFromSpreadsheet()
 *   - buildGmailFilter()
 */

// ============================================================
// Gmail API 差分同期機能
// ============================================================

/**
 * Gmail から既存フィルタを取得
 * @returns {Array} Gmail フィルタ一覧
 */
function getGmailFilters() {
  const response = Gmail.Users.Settings.Filters.list('me')
  return response.filter || []
}

/**
 * Gmail フィルタを削除
 * @param {string} filterId - Gmail フィルタ ID
 * @returns {boolean} 成功したかどうか
 */
function deleteGmailFilter(filterId) {
  try {
    Gmail.Users.Settings.Filters.remove('me', filterId)
    return true
  } catch (e) {
    console.warn(`Failed to delete Gmail filter ${filterId}:`, e.message)
    return false
  }
}

/**
 * ラベル名 ⇔ ID のマップを構築
 * @returns {Object} { nameToId: Map, idToName: Map }
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
 * フィルタの比較用ハッシュを生成
 * @param {Object} filter - 正規化されたフィルタオブジェクト
 * @returns {string} ハッシュ文字列
 */
function generateFilterHash(filter) {
  const parts = [
    filter.criteria.from || '',
    filter.criteria.to || '',
    filter.criteria.subject || '',
    filter.criteria.hasTheWord || '',
    filter.criteria.doesNotHaveTheWord || '',
    filter.action.label || '',
    filter.action.shouldArchive ? '1' : '0',
    filter.action.shouldMarkAsRead ? '1' : '0',
    filter.action.forwardTo || ''
  ]
  return parts.join('|')
}

/**
 * Gmail フィルタをスプレッドシート形式に正規化
 * @param {Object} gmailFilter - Gmail API フィルタ
 * @param {Object} idToName - ラベルID→名前マップ
 * @returns {Object} 正規化されたフィルタ
 */
function normalizeGmailFilter(gmailFilter, idToName) {
  const criteria = gmailFilter.criteria || {}
  const action = gmailFilter.action || {}

  // addLabelIds からラベル名を取得
  let labelName = ''
  if (action.addLabelIds && action.addLabelIds.length > 0) {
    for (const labelId of action.addLabelIds) {
      if (idToName[labelId] && !labelId.startsWith('CATEGORY_')) {
        labelName = idToName[labelId]
        break
      }
    }
  }

  // removeLabelIds から shouldArchive, shouldMarkAsRead を判定
  const removeLabelIds = action.removeLabelIds || []
  const shouldArchive = removeLabelIds.includes('INBOX')
  const shouldMarkAsRead = removeLabelIds.includes('UNREAD')

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
      shouldArchive: shouldArchive,
      shouldMarkAsRead: shouldMarkAsRead,
      forwardTo: action.forward || ''
    }
  }
}

/**
 * スプレッドシートフィルタを正規化
 * @param {Object} ssFilter - スプレッドシートフィルタ
 * @returns {Object} 正規化されたフィルタ
 */
function normalizeSpreadsheetFilter(ssFilter) {
  return {
    id: ssFilter.id,
    criteria: {
      from: ssFilter.criteria.from || '',
      to: ssFilter.criteria.to || '',
      subject: ssFilter.criteria.subject || '',
      hasTheWord: ssFilter.criteria.hasTheWord || '',
      doesNotHaveTheWord: ssFilter.criteria.doesNotHaveTheWord || ''
    },
    action: {
      label: ssFilter.action.label || '',
      shouldArchive: ssFilter.action.shouldArchive || false,
      shouldMarkAsRead: ssFilter.action.shouldMarkAsRead || false,
      forwardTo: ssFilter.action.forwardTo || ''
    }
  }
}

/**
 * 差分を計算
 * @returns {Object} { toCreate: [], toDelete: [], toKeep: [] }
 */
function calculateFilterDiff() {
  const ssFilters = getFiltersFromSpreadsheet()
  const gmailFilters = getGmailFilters()
  const { idToName } = buildLabelMap()

  // スプレッドシートフィルタをハッシュマップに
  const ssHashMap = {}
  for (const filter of ssFilters) {
    const normalized = normalizeSpreadsheetFilter(filter)
    const hash = generateFilterHash(normalized)
    ssHashMap[hash] = normalized
  }

  // Gmail フィルタをハッシュマップに
  const gmailHashMap = {}
  for (const filter of gmailFilters) {
    const normalized = normalizeGmailFilter(filter, idToName)
    const hash = generateFilterHash(normalized)
    gmailHashMap[hash] = {
      ...normalized,
      gmailId: filter.id
    }
  }

  const ssHashes = Object.keys(ssHashMap)
  const gmailHashes = Object.keys(gmailHashMap)

  // SS にあって Gmail にない → 追加、両方にある → 維持
  const toCreate = ssHashes.filter((hash) => !gmailHashMap[hash]).map((hash) => ssHashMap[hash])
  const toKeep = ssHashes.filter((hash) => gmailHashMap[hash]).map((hash) => ssHashMap[hash])

  // Gmail にあって SS にない → 削除
  const toDelete = gmailHashes.filter((hash) => !ssHashMap[hash]).map((hash) => gmailHashMap[hash])

  return { toCreate, toDelete, toKeep }
}

/**
 * フィルタをプレビュー用の簡易形式に変換
 * @param {Object} filter - フィルタオブジェクト
 * @param {boolean} includeGmailId - gmailId を含めるか
 * @returns {Object} プレビュー用オブジェクト
 */
function toPreviewFormat(filter, includeGmailId) {
  const preview = {
    from: filter.criteria.from,
    to: filter.criteria.to,
    subject: filter.criteria.subject,
    hasTheWord: filter.criteria.hasTheWord,
    label: filter.action.label
  }
  if (includeGmailId && filter.gmailId) {
    preview.gmailId = filter.gmailId
  }
  return preview
}

/**
 * 差分プレビューを取得
 * @returns {Object} プレビュー情報
 */
function previewFiltersDiff() {
  const diff = calculateFilterDiff()

  return {
    toCreate: diff.toCreate.map((f) => toPreviewFormat(f, false)),
    toDelete: diff.toDelete.map((f) => toPreviewFormat(f, true)),
    toKeepCount: diff.toKeep.length,
    summary: {
      create: diff.toCreate.length,
      delete: diff.toDelete.length,
      keep: diff.toKeep.length
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
 * 差分を適用
 * @param {boolean} dryRun - true の場合は実際には適用しない
 * @returns {Object} 適用結果
 */
function applyFiltersDiff(dryRun) {
  const diff = calculateFilterDiff()
  const results = { created: 0, deleted: 0, errors: [] }

  if (dryRun) {
    return {
      ...results,
      wouldCreate: diff.toCreate.length,
      wouldDelete: diff.toDelete.length,
      dryRun: true
    }
  }

  // 削除処理
  for (const filter of diff.toDelete) {
    try {
      if (deleteGmailFilter(filter.gmailId)) {
        results.deleted++
      }
    } catch (e) {
      results.errors.push({ action: 'delete', filter: filter, error: e.message })
    }
  }

  // 作成処理
  for (const filter of diff.toCreate) {
    try {
      const gmailFilter = buildGmailFilter(filter)

      if (!hasValidCriteria(gmailFilter)) {
        results.errors.push({ action: 'create', filter: filter, error: 'Empty criteria' })
        continue
      }

      Gmail.Users.Settings.Filters.create(gmailFilter, 'me')
      results.created++
    } catch (e) {
      results.errors.push({ action: 'create', filter: filter, error: e.message })
    }
  }

  addHistory(
    'SYNC_FILTERS',
    'Gmail',
    `Created: ${results.created}, Deleted: ${results.deleted}, Errors: ${results.errors.length}`
  )

  return results
}
