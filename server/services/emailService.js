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
 * フィルタ外メールを検索
 * @param {number} max - 最大件数
 * @returns {Array} メール一覧
 */
function findUnfilteredEmails(max) {
  // ユーザーラベルがついていないメールを検索（送信済み・下書きは除外）
  const query = 'has:nouserlabels -in:sent -in:drafts'
  return searchGmailEmails(query, max)
}
