/**
 * Delete Rule Service
 * 削除ルールの管理と実行を担当
 */

const DELETE_RULES_SHEET = 'DeleteRules'

/**
 * 削除ルールをスプレッドシートから取得
 * @returns {Array} 削除ルール一覧
 */
function getDeleteRulesFromStorage() {
  const sheet = getSheet(DELETE_RULES_SHEET)
  const lastRow = sheet.getLastRow()

  if (lastRow <= 1) return []

  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues()
  return rowsToDeleteRules(data)
}

/**
 * 削除ルールをスプレッドシートに保存
 * @param {Array} rules - 削除ルール一覧
 * @returns {Object} 保存結果
 */
function saveDeleteRulesToStorage(rules) {
  const sheet = getSheet(DELETE_RULES_SHEET)
  const lastRow = sheet.getLastRow()

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent()
  }

  if (rules.length > 0) {
    const data = deleteRulesToRows(rules)
    sheet.getRange(2, 1, data.length, 3).setValues(data)
  }

  addHistory('SAVE_DELETE_RULES', 'DeleteRules', `Saved ${rules.length} rules`)
  return { success: true }
}

/**
 * 指定ラベルの古いメールを削除
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
  return { deleted }
}

/**
 * すべての有効な削除ルールを実行
 * @returns {Array} 削除結果一覧
 */
function executeAllDeleteRules() {
  const rules = getDeleteRulesFromStorage()
  const results = []

  for (const rule of rules) {
    if (!rule.enabled) continue
    const result = executeDeleteByLabel(rule.labelName, rule.delayDays)
    results.push({
      label: rule.labelName,
      days: rule.delayDays,
      deleted: result.deleted
    })
  }

  return results
}
