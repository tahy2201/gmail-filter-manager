/**
 * トリガー管理Controller
 * 日次削除トリガーの設定・削除・状態取得を担当
 */

/**
 * 日次削除トリガーの状態を取得
 * @returns {Object} トリガー状態
 */
function getTriggerStatus() {
  try {
    return getDeleteTriggerStatus()
  } catch (error) {
    console.error('Error getting trigger status:', error)
    throw new Error(`Failed to get trigger status: ${error.message}`)
  }
}

/**
 * 日次削除トリガーをセットアップ
 * @param {number} hour 実行時刻（0-23）
 * @returns {Object} セットアップ結果
 */
function setupDeleteTrigger(hour) {
  try {
    return setupDailyDeleteTrigger(hour)
  } catch (error) {
    console.error('Error setting up delete trigger:', error)
    throw new Error(`Failed to setup delete trigger: ${error.message}`)
  }
}

/**
 * 日次削除トリガーを削除
 * @returns {Object} 削除結果
 */
function removeDeleteTrigger() {
  try {
    return removeDailyDeleteTrigger()
  } catch (error) {
    console.error('Error removing delete trigger:', error)
    throw new Error(`Failed to remove delete trigger: ${error.message}`)
  }
}
