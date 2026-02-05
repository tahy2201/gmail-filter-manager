/**
 * Filter Mapper
 * フィルタオブジェクト ⇔ スプレッドシート行の変換（純粋関数）
 */

/**
 * スプレッドシート行をフィルタオブジェクトに変換
 * @param {Array} row - スプレッドシートの行 [id, from, to, subject, hasTheWord, doesNotHaveTheWord, label, shouldArchive, shouldMarkAsRead, shouldNeverSpam]
 * @returns {Object} フィルタオブジェクト
 */
function rowToFilter(row) {
  return {
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
  }
}

/**
 * フィルタオブジェクトをスプレッドシート行に変換
 * @param {Object} filter - フィルタオブジェクト
 * @returns {Array} スプレッドシートの行
 */
function filterToRow(filter) {
  return [
    filter.id,
    filter.criteria.from || '',
    filter.criteria.to || '',
    filter.criteria.subject || '',
    filter.criteria.hasTheWord || '',
    filter.criteria.doesNotHaveTheWord || '',
    filter.action.label || '',
    filter.action.shouldArchive || false,
    filter.action.shouldMarkAsRead || false,
    filter.action.shouldNeverSpam || false
  ]
}

/**
 * 複数のスプレッドシート行をフィルタオブジェクト配列に変換
 * @param {Array[]} rows - スプレッドシートの行配列
 * @returns {Array} フィルタオブジェクト配列
 */
function rowsToFilters(rows) {
  const filters = []
  for (const row of rows) {
    if (!row[0]) continue // ID が空ならスキップ
    filters.push(rowToFilter(row))
  }
  return filters
}

/**
 * 複数のフィルタオブジェクトをスプレッドシート行配列に変換
 * @param {Array} filters - フィルタオブジェクト配列
 * @returns {Array[]} スプレッドシートの行配列
 */
function filtersToRows(filters) {
  return filters.map(filterToRow)
}
