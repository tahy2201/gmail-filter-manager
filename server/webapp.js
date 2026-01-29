/**
 * Gmail Filter Manager - Web アプリケーション エントリーポイント
 */

/**
 * Web アプリの GET リクエストハンドラ
 * @param {Object} e - イベントオブジェクト
 * @returns {HtmlOutput} HTML 出力
 */
function doGet(e) {
  try {
    const template = HtmlService.createTemplateFromFile('index')
    const html = template
      .evaluate()
      .setTitle('Gmail Filter Manager')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    return html
  } catch (error) {
    console.error('Error in doGet:', error)
    return HtmlService.createHtmlOutput(`
      <h1>Error</h1>
      <p>${error.message}</p>
    `)
  }
}

/**
 * フィルタ一覧を取得
 * @returns {Array} フィルタ一覧
 */
function getFilters() {
  try {
    return getFiltersFromSpreadsheet()
  } catch (error) {
    console.error('Error getting filters:', error)
    throw new Error(`Failed to get filters: ${error.message}`)
  }
}

/**
 * フィルタを保存
 * @param {Array} filters - フィルタ一覧
 * @returns {Object} 保存結果
 */
function saveFilters(filters) {
  try {
    return saveFiltersToSpreadsheet(filters)
  } catch (error) {
    console.error('Error saving filters:', error)
    throw new Error(`Failed to save filters: ${error.message}`)
  }
}

/**
 * XML からフィルタをインポート
 * @param {string} xml - XML 文字列
 * @returns {Object} インポート結果
 */
function importFiltersXml(xml) {
  try {
    return importFiltersFromXml(xml)
  } catch (error) {
    console.error('Error importing filters:', error)
    throw new Error(`Failed to import filters: ${error.message}`)
  }
}

/**
 * Gmail にフィルタを適用
 * @returns {Object} 適用結果
 */
function applyFiltersToGmail() {
  try {
    return applyFilters()
  } catch (error) {
    console.error('Error applying filters:', error)
    throw new Error(`Failed to apply filters: ${error.message}`)
  }
}

/**
 * メール検索
 * @param {string} query - 検索クエリ
 * @param {number} max - 最大件数
 * @returns {Array} メール一覧
 */
function searchEmails(query, max) {
  try {
    return searchGmailEmails(query, max || 50)
  } catch (error) {
    console.error('Error searching emails:', error)
    throw new Error(`Failed to search emails: ${error.message}`)
  }
}

/**
 * ラベル一覧を取得
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
 * 削除ルール一覧を取得
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
 * 削除ルールを保存
 * @param {Array} rules - 削除ルール一覧
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
 * 削除ルールを実行
 * @param {string} labelName - ラベル名
 * @param {number} days - 日数
 * @returns {Object} 実行結果
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
 * 現在のユーザー情報を取得
 * @returns {Object} ユーザー情報
 */
function getCurrentUser() {
  try {
    return {
      email: Session.getActiveUser().getEmail()
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    throw new Error(`Failed to get current user: ${error.message}`)
  }
}

/**
 * フィルタ外メールを取得
 * @param {number} max - 最大件数
 * @returns {Array} メール一覧
 */
function getUnfilteredEmails(max) {
  try {
    return findUnfilteredEmails(max || 50)
  } catch (error) {
    console.error('Error getting unfiltered emails:', error)
    throw new Error(`Failed to get unfiltered emails: ${error.message}`)
  }
}

/**
 * スプレッドシートの URL を取得
 * @returns {Object} スプレッドシート情報
 */
function getDataSpreadsheetUrl() {
  try {
    return {
      url: getSpreadsheetUrl()
    }
  } catch (error) {
    console.error('Error getting spreadsheet URL:', error)
    throw new Error(`Failed to get spreadsheet URL: ${error.message}`)
  }
}

/**
 * スケジュールされた削除ルールを実行（トリガー用）
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
 * 初期セットアップ（スプレッドシート作成）
 */
function setup() {
  const ss = getOrCreateSpreadsheet()
  console.log('Spreadsheet created/initialized: ' + ss.getUrl())
  return {
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId()
  }
}

/**
 * フィルタ差分のプレビューを取得
 * @returns {Object} 差分プレビュー
 */
function previewFilterDiff() {
  try {
    return previewFiltersDiff()
  } catch (error) {
    console.error('Error previewing filter diff:', error)
    throw new Error(`Failed to preview filter diff: ${error.message}`)
  }
}

/**
 * フィルタ差分を適用
 * @param {boolean} dryRun - true の場合は実際には適用しない
 * @returns {Object} 適用結果
 */
function applyFilterDiff(dryRun) {
  try {
    return applyFiltersDiff(dryRun === true)
  } catch (error) {
    console.error('Error applying filter diff:', error)
    throw new Error(`Failed to apply filter diff: ${error.message}`)
  }
}
