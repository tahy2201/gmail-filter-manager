/**
 * Trigger Service
 * 日次削除トリガーの管理を担当
 */

/**
 * 日次削除トリガーをセットアップ
 * @param {number} hour - 実行時刻（0-23）
 * @returns {Object} セットアップ結果
 */
function setupDailyDeleteTrigger(hour) {
  // 既存の自分のトリガーを削除
  removeDailyDeleteTrigger()

  const triggerHour = hour ?? 3

  const trigger = ScriptApp.newTrigger('runScheduledDeleteRules')
    .timeBased()
    .atHour(triggerHour)
    .everyDays(1)
    .inTimezone('Asia/Tokyo')
    .create()

  const userProps = PropertiesService.getUserProperties()
  userProps.setProperty('DELETE_TRIGGER_ID', trigger.getUniqueId())
  userProps.setProperty('DELETE_TRIGGER_HOUR', String(triggerHour))

  console.log(`Daily delete trigger set for ${triggerHour}:00 JST`)
  addHistory('SETUP_TRIGGER', 'DeleteTrigger', `Scheduled daily at ${triggerHour}:00 JST`)
  return { success: true, hour: triggerHour }
}

/**
 * 日次削除トリガーを削除
 * @returns {Object} 削除結果
 */
function removeDailyDeleteTrigger() {
  const userProps = PropertiesService.getUserProperties()
  const savedTriggerId = userProps.getProperty('DELETE_TRIGGER_ID')
  let removed = false

  if (savedTriggerId) {
    const triggers = ScriptApp.getProjectTriggers()
    for (const trigger of triggers) {
      if (trigger.getUniqueId() === savedTriggerId) {
        ScriptApp.deleteTrigger(trigger)
        removed = true
        break
      }
    }
  }

  userProps.deleteProperty('DELETE_TRIGGER_ID')
  userProps.deleteProperty('DELETE_TRIGGER_HOUR')

  console.log('Daily delete trigger removed')
  if (removed) {
    addHistory('REMOVE_TRIGGER', 'DeleteTrigger', 'Daily trigger removed')
  }
  return { success: true }
}

/**
 * 日次削除トリガーの状態を取得
 * @returns {Object} トリガー状態
 */
function getDeleteTriggerStatus() {
  const userProps = PropertiesService.getUserProperties()
  const savedTriggerId = userProps.getProperty('DELETE_TRIGGER_ID')

  if (savedTriggerId) {
    const triggers = ScriptApp.getProjectTriggers()
    for (const trigger of triggers) {
      if (trigger.getUniqueId() === savedTriggerId) {
        const savedHour = userProps.getProperty('DELETE_TRIGGER_HOUR')
        const hour = savedHour ? Number(savedHour) : 3
        return {
          enabled: true,
          hour: isNaN(hour) ? 3 : hour
        }
      }
    }
    // トリガーが存在しない場合はプロパティをクリーンアップ
    userProps.deleteProperty('DELETE_TRIGGER_ID')
    userProps.deleteProperty('DELETE_TRIGGER_HOUR')
  }

  return { enabled: false, hour: null }
}
