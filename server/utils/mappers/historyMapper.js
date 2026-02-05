/**
 * History Mapper
 * 履歴オブジェクト ⇔ スプレッドシート行の変換（純粋関数）
 */

/**
 * スプレッドシート行を履歴オブジェクトに変換
 * @param {Array} row - スプレッドシートの行 [timestamp, action, target, details]
 * @returns {Object} 履歴オブジェクト
 */
function rowToHistory(row) {
  return {
    timestamp: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
    action: String(row[1] || ''),
    target: String(row[2] || ''),
    details: String(row[3] || '')
  }
}

/**
 * 複数のスプレッドシート行を履歴オブジェクト配列に変換
 * @param {Array[]} rows - スプレッドシートの行配列
 * @returns {Array} 履歴オブジェクト配列
 */
function rowsToHistory(rows) {
  const history = []
  // 逆順でループ（新しいものから）
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    if (!row[0]) continue // timestamp が空ならスキップ
    history.push(rowToHistory(row))
  }
  return history
}
