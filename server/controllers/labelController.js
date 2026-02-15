/**
 * ラベル管理Controller
 * Gmailラベルの取得・作成・更新・削除を担当
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

/**
 * ラベルを作成
 * @param {string} labelName - ラベル名
 * @returns {Object} 作成されたラベル
 */
function createLabel(labelName) {
  try {
    return createLabelInGmail(labelName)
  } catch (error) {
    console.error('Error creating label:', error)
    throw new Error(`Failed to create label: ${error.message}`)
  }
}

/**
 * ラベルをリネーム
 * @param {string} labelId - ラベルID
 * @param {string} newName - 新しいラベル名
 * @returns {Object} 更新されたラベル
 */
function renameLabel(labelId, newName) {
  try {
    return renameLabelInGmail(labelId, newName)
  } catch (error) {
    console.error('Error renaming label:', error)
    throw new Error(`Failed to rename label: ${error.message}`)
  }
}

/**
 * ラベルを削除
 * @param {string} labelId - ラベルID
 * @returns {Object} 削除結果
 */
function deleteLabel(labelId) {
  try {
    return deleteLabelFromGmail(labelId)
  } catch (error) {
    console.error('Error deleting label:', error)
    throw new Error(`Failed to delete label: ${error.message}`)
  }
}

/**
 * ラベル削除の影響をチェック
 * @param {string} labelId - ラベルID
 * @returns {Object} 影響情報
 */
function checkLabelDeletionImpact(labelId) {
  try {
    return getLabelDeletionImpact(labelId)
  } catch (error) {
    console.error('Error checking label deletion impact:', error)
    throw new Error(`Failed to check label deletion impact: ${error.message}`)
  }
}

/**
 * ラベルのカラーを更新
 * @param {string} labelId - ラベルID
 * @param {string} backgroundColor - 背景色
 * @param {string} textColor - テキスト色
 * @returns {Object} 更新されたラベル
 */
function updateLabelColor(labelId, backgroundColor, textColor) {
  try {
    return updateLabelColorInGmail(labelId, backgroundColor, textColor)
  } catch (error) {
    console.error('Error updating label color:', error)
    throw new Error(`Failed to update label color: ${error.message}`)
  }
}
