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
 * ラベルを ID で取得
 * @param {string} labelId - ラベル ID
 * @returns {Object|null} ラベル
 */
function getLabelById(labelId) {
  try {
    const label = Gmail.Users.Labels.get('me', labelId)
    return {
      id: label.id,
      name: label.name,
      type: label.type === 'system' ? 'system' : 'user'
    }
  } catch (e) {
    return null
  }
}

/**
 * ラベルを名前で取得
 * @param {string} labelName - ラベル名
 * @returns {Object|null} ラベル
 */
function getLabelByName(labelName) {
  const labels = listGmailLabels()
  return labels.find((l) => l.name === labelName) || null
}

/**
 * ラベルを作成
 * @param {string} labelName - ラベル名
 * @returns {Object} 作成されたラベル
 */
function createLabel(labelName) {
  const label = Gmail.Users.Labels.create(
    {
      name: labelName,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show'
    },
    'me'
  )

  return {
    id: label.id,
    name: label.name,
    type: 'user'
  }
}

/**
 * ラベルを削除
 * @param {string} labelId - ラベル ID
 * @returns {boolean} 成功したかどうか
 */
function deleteLabel(labelId) {
  try {
    Gmail.Users.Labels.remove('me', labelId)
    return true
  } catch (e) {
    console.error('Error deleting label:', e)
    return false
  }
}
