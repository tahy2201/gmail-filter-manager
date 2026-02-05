/**
 * String Utilities
 * 文字列操作のユーティリティ関数
 */

/**
 * 日付をフォーマット
 * @param {Date} date - 日付
 * @returns {string} フォーマットされた日付
 */
function formatDate(date) {
  return Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss')
}

/**
 * 文字列を切り詰め
 * @param {string} str - 文字列
 * @param {number} maxLength - 最大長
 * @returns {string} 切り詰められた文字列
 */
function truncate(str, maxLength) {
  if (!str) return ''
  str = str.replace(/\s+/g, ' ').trim()
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}
