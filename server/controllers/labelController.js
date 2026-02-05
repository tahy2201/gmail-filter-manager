/**
 * ラベル管理Controller
 * Gmailラベルの取得を担当
 */

/**
 * Gmailのラベル一覧を取得
 * @returns {Array} ラベル一覧
 */
function getLabels() {
  try {
    return listGmailLabels()
  } catch (error) {
    console.error('Error getting labels:', error)
    throw new Error(`Failed to get labels: ${error.message}`)
  }
}
