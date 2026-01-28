/**
 * Gmail Delete Service
 * メール削除ルールの管理と実行を担当
 */

const DELETE_RULES_SHEET = 'DeleteRules'

/**
 * スプレッドシートから削除ルールを取得
 * @returns {Array} 削除ルール一覧
 */
function getDeleteRulesFromStorage() {
  const sheet = getSheet(DELETE_RULES_SHEET)
  const lastRow = sheet.getLastRow()

  if (lastRow <= 1) {
    return []
  }

  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues()
  const rules = []

  for (const row of data) {
    if (!row[0]) continue // labelName が空ならスキップ

    rules.push({
      labelName: row[0],
      delayDays: Number(row[1]) || 30,
      enabled: row[2] === true || row[2] === 'TRUE'
    })
  }

  return rules
}

/**
 * 削除ルールをスプレッドシートに保存
 * @param {Array} rules - 削除ルール一覧
 * @returns {Object} 保存結果
 */
function saveDeleteRulesToStorage(rules) {
  const sheet = getSheet(DELETE_RULES_SHEET)

  // 既存データをクリア（ヘッダー以外）
  const lastRow = sheet.getLastRow()
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent()
  }

  // 新しいデータを書き込み
  if (rules.length > 0) {
    const data = rules.map((r) => [r.labelName, r.delayDays, r.enabled])

    sheet.getRange(2, 1, data.length, 3).setValues(data)
  }

  addHistory('SAVE_DELETE_RULES', 'DeleteRules', `Saved ${rules.length} rules`)

  return { success: true }
}

/**
 * ラベルに基づいてメールを削除
 * @param {string} labelName - ラベル名
 * @param {number} days - 経過日数
 * @returns {Object} 削除結果
 */
function executeDeleteByLabel(labelName, days) {
  const query = `older_than:${days}d -is:important label:${labelName}`
  const threads = GmailApp.search(query)

  let deleted = 0
  for (const thread of threads) {
    try {
      thread.moveToTrash()
      deleted++
    } catch (e) {
      console.error(`Error deleting thread ${thread.getId()}:`, e)
    }
  }

  console.log(`Deleted ${deleted} threads from label "${labelName}" (${days} days old)`)
  addHistory('DELETE_EMAILS', labelName, `Deleted ${deleted} threads (older than ${days} days)`)

  return { deleted: deleted }
}

/**
 * 全ての有効な削除ルールを実行
 * @returns {Array} 実行結果一覧
 */
function executeAllDeleteRules() {
  const rules = getDeleteRulesFromStorage()
  const results = []

  for (const rule of rules) {
    if (rule.enabled) {
      const result = executeDeleteByLabel(rule.labelName, rule.delayDays)
      results.push({
        label: rule.labelName,
        days: rule.delayDays,
        deleted: result.deleted
      })
    }
  }

  return results
}

/**
 * 日次トリガーをセットアップ
 * @param {number} hour - 実行時間（0-23）
 */
function setupDailyDeleteTrigger(hour) {
  // 既存のトリガーを削除
  const triggers = ScriptApp.getProjectTriggers()
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'runScheduledDeleteRules') {
      ScriptApp.deleteTrigger(trigger)
    }
  }

  // 新しいトリガーを作成
  ScriptApp.newTrigger('runScheduledDeleteRules')
    .timeBased()
    .atHour(hour || 3)
    .everyDays(1)
    .inTimezone('Asia/Tokyo')
    .create()

  console.log(`Daily delete trigger set for ${hour || 3}:00 JST`)
}

/**
 * トリガーを削除
 */
function removeDailyDeleteTrigger() {
  const triggers = ScriptApp.getProjectTriggers()
  for (const trigger of triggers) {
    if (trigger.getHandlerFunction() === 'runScheduledDeleteRules') {
      ScriptApp.deleteTrigger(trigger)
    }
  }
  console.log('Daily delete trigger removed')
}
