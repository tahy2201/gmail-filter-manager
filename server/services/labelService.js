/**
 * Gmail Label Service
 * ラベルの取得と管理を担当
 */

/**
 * Gmail ラベル一覧を取得
 * @returns {Array} ラベル一覧
 */
function listGmailLabels() {
  const response = Gmail.Users.Labels.list('me')
  const labels = response.labels || []

  return labels
    .map((label) => ({
      id: label.id,
      name: label.name,
      type: label.type === 'system' ? 'system' : 'user'
    }))
    .sort((a, b) => {
      // ユーザーラベルを先に、その後システムラベル
      if (a.type !== b.type) {
        return a.type === 'user' ? -1 : 1
      }
      return a.name.localeCompare(b.name)
    })
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
