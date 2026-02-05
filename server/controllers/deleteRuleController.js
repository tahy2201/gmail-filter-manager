/**
 * 削除ルール管理Controller
 * 削除ルールの取得・保存・実行を担当
 */

/**
 * 削除ルールをスプレッドシートから取得
 * @returns {Array} 削除ルール一覧
 */
function getDeleteRules() {
  try {
    return getDeleteRulesFromStorage()
  } catch (error) {
    console.error('Error getting delete rules:', error)
    throw new Error(`Failed to get delete rules: ${error.message}`)
  }
}

/**
 * 削除ルールをスプレッドシートに保存
 * @param {Array} rules 削除ルール一覧
 * @returns {Object} 保存結果
 */
function saveDeleteRules(rules) {
  try {
    return saveDeleteRulesToStorage(rules)
  } catch (error) {
    console.error('Error saving delete rules:', error)
    throw new Error(`Failed to save delete rules: ${error.message}`)
  }
}

/**
 * 指定ラベルの古いメールを削除
 * @param {string} labelName ラベル名
 * @param {number} days 経過日数
 * @returns {Object} 削除結果
 */
function executeDeleteRule(labelName, days) {
  try {
    return executeDeleteByLabel(labelName, days)
  } catch (error) {
    console.error('Error executing delete rule:', error)
    throw new Error(`Failed to execute delete rule: ${error.message}`)
  }
}

/**
 * スケジュール実行：全削除ルールを実行
 * @returns {Array} 削除結果一覧
 */
function runScheduledDeleteRules() {
  try {
    const results = executeAllDeleteRules()

    let totalDeleted = 0
    for (const result of results) {
      totalDeleted += result.deleted
      console.log(`Deleted ${result.deleted} emails from ${result.label}`)
    }

    console.log(`Total deleted: ${totalDeleted} emails`)
    return results
  } catch (error) {
    console.error('Error running scheduled delete rules:', error)
    throw new Error(`Failed to run scheduled delete rules: ${error.message}`)
  }
}

/**
 * 削除履歴を取得
 * @param {number} limit 取得件数
 * @returns {Array} 履歴一覧
 */
function getDeleteHistory(limit) {
  try {
    return getHistory(limit || 50)
  } catch (error) {
    console.error('Error getting delete history:', error)
    throw new Error(`Failed to get delete history: ${error.message}`)
  }
}
