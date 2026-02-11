/**
 * Delete Rule Mapper
 * 削除ルールオブジェクト ⇔ スプレッドシート行の変換（純粋関数）
 */

/**
 * スプレッドシート行を削除ルールオブジェクトに変換
 * @param {Array} row - スプレッドシートの行 [labelId, labelName, delayDays, enabled]
 * @returns {Object} 削除ルールオブジェクト
 */
function rowToDeleteRule(row) {
  return {
    labelId: row[0],
    labelName: row[1],
    delayDays: Number(row[2]) || 30,
    enabled: row[3] === true || row[3] === 'TRUE'
  }
}

/**
 * 削除ルールオブジェクトをスプレッドシート行に変換
 * @param {Object} rule - 削除ルールオブジェクト
 * @returns {Array} スプレッドシートの行
 */
function deleteRuleToRow(rule) {
  return [rule.labelId, rule.labelName, rule.delayDays, rule.enabled]
}

/**
 * 複数のスプレッドシート行を削除ルールオブジェクト配列に変換
 * @param {Array[]} rows - スプレッドシートの行配列
 * @returns {Array} 削除ルールオブジェクト配列
 */
function rowsToDeleteRules(rows) {
  const rules = []
  for (const row of rows) {
    if (!row[0]) continue // labelId が空ならスキップ
    rules.push(rowToDeleteRule(row))
  }
  return rules
}

/**
 * 複数の削除ルールオブジェクトをスプレッドシート行配列に変換
 * @param {Array} rules - 削除ルールオブジェクト配列
 * @returns {Array[]} スプレッドシートの行配列
 */
function deleteRulesToRows(rules) {
  return rules.map(deleteRuleToRow)
}
