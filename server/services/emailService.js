/**
 * Gmail Email Service
 * メールの検索とプレビューを担当
 */

/**
 * Gmail を検索
 * @param {string} query - 検索クエリ
 * @param {number} max - 最大件数
 * @returns {Array} メールプレビュー一覧
 */
function searchGmailEmails(query, max) {
  if (!query || query.trim() === '') {
    return []
  }

  const threads = GmailApp.search(query, 0, max)
  const emails = []

  for (const thread of threads) {
    const messages = thread.getMessages()
    if (messages.length > 0) {
      const message = messages[messages.length - 1] // 最新のメッセージ
      emails.push({
        id: message.getId(),
        threadId: thread.getId(),
        subject: message.getSubject() || '(No Subject)',
        from: message.getFrom(),
        date: formatDate(message.getDate()),
        snippet: thread.getFirstMessageSubject() + ' - ' + truncate(message.getPlainBody(), 100)
      })
    }
  }

  return emails
}

/**
 * メッセージの詳細を取得
 * @param {string} messageId - メッセージ ID
 * @returns {Object} メッセージ詳細
 */
function getEmailDetail(messageId) {
  const message = GmailApp.getMessageById(messageId)

  if (!message) {
    throw new Error(`Message not found: ${messageId}`)
  }

  return {
    id: message.getId(),
    threadId: message.getThread().getId(),
    subject: message.getSubject() || '(No Subject)',
    from: message.getFrom(),
    to: message.getTo(),
    cc: message.getCc(),
    date: formatDate(message.getDate()),
    body: message.getPlainBody(),
    labels: message
      .getThread()
      .getLabels()
      .map((l) => l.getName())
  }
}

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
