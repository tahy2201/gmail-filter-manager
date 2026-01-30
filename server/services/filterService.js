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
  const filters = []

  for (const row of data) {
    if (!row[0]) continue // ID が空ならスキップ

    filters.push({
      id: row[0],
      criteria: {
        from: row[1] || undefined,
        to: row[2] || undefined,
        subject: row[3] || undefined,
        hasTheWord: row[4] || undefined,
        doesNotHaveTheWord: row[5] || undefined
      },
      action: {
        label: row[6] || undefined,
        shouldArchive: row[7] === true || row[7] === 'TRUE',
        shouldMarkAsRead: row[8] === true || row[8] === 'TRUE',
        shouldNeverSpam: row[9] === true || row[9] === 'TRUE'
      }
    })
  }

  return filters
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
    const data = filters.map((f) => [
      f.id,
      f.criteria.from || '',
      f.criteria.to || '',
      f.criteria.subject || '',
      f.criteria.hasTheWord || '',
      f.criteria.doesNotHaveTheWord || '',
      f.action.label || '',
      f.action.shouldArchive || false,
      f.action.shouldMarkAsRead || false,
      f.action.shouldNeverSpam || false
    ])

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
 * Gmail フィルタ XML をパース
 * @param {string} xml - XML 文字列
 * @returns {Array} フィルタ一覧
 */
function parseFiltersXml(xml) {
  const doc = XmlService.parse(xml)
  const root = doc.getRootElement()
  const ns = root.getNamespace()
  const appsNs = XmlService.getNamespace('apps', 'http://schemas.google.com/apps/2006')

  const entries = root.getChildren('entry', ns)
  const filters = []

  for (const entry of entries) {
    const id = entry.getChildText('id', ns) || ''
    const properties = entry.getChildren('property', appsNs)

    const filter = {
      id: id,
      criteria: {},
      action: {}
    }

    for (const prop of properties) {
      const name = prop.getAttribute('name').getValue()
      const value = prop.getAttribute('value').getValue()

      switch (name) {
        case 'from':
          filter.criteria.from = value
          break
        case 'to':
          filter.criteria.to = value
          break
        case 'subject':
          filter.criteria.subject = value
          break
        case 'hasTheWord':
          filter.criteria.hasTheWord = value
          break
        case 'doesNotHaveTheWord':
          filter.criteria.doesNotHaveTheWord = value
          break
        case 'label':
          filter.action.label = value
          break
        case 'shouldArchive':
          filter.action.shouldArchive = value === 'true'
          break
        case 'shouldMarkAsRead':
          filter.action.shouldMarkAsRead = value === 'true'
          break
        case 'shouldNeverSpam':
          filter.action.shouldNeverSpam = value === 'true'
          break
        case 'shouldNeverMarkAsImportant':
          filter.action.shouldNeverMarkAsImportant = value === 'true'
          break
        case 'forwardTo':
          filter.action.forwardTo = value
          break
      }
    }

    filters.push(filter)
  }

  return filters
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

/**
 * ラベルを取得または作成
 * @param {string} labelName - ラベル名
 * @returns {Object} Gmail ラベル
 */
function getOrCreateLabel(labelName) {
  const labels = Gmail.Users.Labels.list('me').labels || []
  const existing = labels.find((l) => l.name === labelName)

  if (existing) {
    return existing
  }

  // ラベルを作成
  return Gmail.Users.Labels.create(
    {
      name: labelName,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show'
    },
    'me'
  )
}

/**
 * フィルタ外メールを検索
 * @param {number} max - 最大件数
 * @returns {Array} メール一覧
 */
function findUnfilteredEmails(max) {
  const filters = getFiltersFromSpreadsheet()

  // 全フィルタのクエリを否定で結合
  const negatedQueries = []
  for (const filter of filters) {
    const parts = []
    if (filter.criteria.from) {
      parts.push(`from:(${filter.criteria.from})`)
    }
    if (filter.criteria.to) {
      parts.push(`to:(${filter.criteria.to})`)
    }
    if (filter.criteria.subject) {
      parts.push(`subject:(${filter.criteria.subject})`)
    }
    if (filter.criteria.hasTheWord) {
      parts.push(`(${filter.criteria.hasTheWord})`)
    }

    if (parts.length > 0) {
      negatedQueries.push(`-(${parts.join(' ')})`)
    }
  }

  const query = negatedQueries.join(' ')
  return searchGmailEmails(query, max)
}

/**
 * 単一フィルタを追加
 * @param {Object} filter - フィルタ
 * @returns {Object} 保存結果
 */
function addFilter(filter) {
  const filters = getFiltersFromSpreadsheet()

  // ID を生成
  if (!filter.id) {
    filter.id = 'filter_' + Date.now()
  }

  filters.push(filter)
  return saveFiltersToSpreadsheet(filters)
}

/**
 * フィルタを更新
 * @param {string} filterId - フィルタID
 * @param {Object} updates - 更新内容
 * @returns {Object} 保存結果
 */
function updateFilter(filterId, updates) {
  const filters = getFiltersFromSpreadsheet()
  const index = filters.findIndex((f) => f.id === filterId)

  if (index === -1) {
    throw new Error(`Filter not found: ${filterId}`)
  }

  filters[index] = { ...filters[index], ...updates }
  return saveFiltersToSpreadsheet(filters)
}

/**
 * フィルタを削除
 * @param {string} filterId - フィルタID
 * @returns {Object} 保存結果
 */
function deleteFilter(filterId) {
  const filters = getFiltersFromSpreadsheet()
  const newFilters = filters.filter((f) => f.id !== filterId)

  if (newFilters.length === filters.length) {
    throw new Error(`Filter not found: ${filterId}`)
  }

  return saveFiltersToSpreadsheet(newFilters)
}

/**
 * フィルタ条件から Gmail 検索クエリを構築
 * @param {Object} criteria - フィルタ条件
 * @returns {string} Gmail 検索クエリ
 */
function buildSearchQuery(criteria) {
  const parts = []

  if (criteria.from) {
    parts.push(`from:(${criteria.from})`)
  }
  if (criteria.to) {
    parts.push(`to:(${criteria.to})`)
  }
  if (criteria.subject) {
    parts.push(`subject:(${criteria.subject})`)
  }
  if (criteria.hasTheWord) {
    parts.push(`(${criteria.hasTheWord})`)
  }
  if (criteria.doesNotHaveTheWord) {
    parts.push(`-(${criteria.doesNotHaveTheWord})`)
  }

  return parts.join(' ')
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
  let messages = []
  let pageToken = null
  const maxResults = 500 // 一度に取得する最大数

  try {
    do {
      const response = Gmail.Users.Messages.list('me', {
        q: query,
        maxResults: maxResults,
        pageToken: pageToken
      })

      if (response.messages) {
        messages = messages.concat(response.messages)
      }

      pageToken = response.nextPageToken
    } while (pageToken && messages.length < 1000) // 最大1000件まで

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

  // バッチ修正 (100件ずつ)
  const batchSize = 100
  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize)
    const messageIds = batch.map(m => m.id)

    try {
      Gmail.Users.Messages.batchModify({
        ids: messageIds,
        addLabelIds: addLabelIds,
        removeLabelIds: removeLabelIds.length > 0 ? removeLabelIds : undefined
      }, 'me')

      appliedCount += batch.length
    } catch (e) {
      errors.push(`Batch ${Math.floor(i / batchSize) + 1} failed: ${e.message}`)
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
