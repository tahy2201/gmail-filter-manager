/**
 * Filter Utilities
 * フィルタ関連のユーティリティ関数（純粋関数のみ）
 */

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
