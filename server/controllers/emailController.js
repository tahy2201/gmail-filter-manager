/**
 * メール検索Controller
 * Gmailのメール検索・取得を担当
 */

/**
 * Gmailでメールを検索
 * @param {string} query 検索クエリ
 * @param {number} max 最大取得数
 * @returns {Array} メール一覧
 */
function searchEmails(query, max) {
  try {
    return searchGmailEmails(query, max || 50)
  } catch (error) {
    console.error('Error searching emails:', error)
    throw new Error(`Failed to search emails: ${error.message}`)
  }
}

/**
 * フィルタに一致しないメールを取得
 * @param {number} max 最大取得数
 * @returns {Array} メール一覧
 */
function getUnfilteredEmails(max) {
  try {
    return findUnfilteredEmails(max || 50)
  } catch (error) {
    console.error('Error getting unfiltered emails:', error)
    throw new Error(`Failed to get unfiltered emails: ${error.message}`)
  }
}
