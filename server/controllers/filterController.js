/**
 * フィルタ管理Controller
 * フィルタの取得・保存・インポート・Gmail適用を担当
 */

/**
 * スプレッドシートからフィルタを取得
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
 * フィルタをスプレッドシートに保存
 * @param {Array} filters フィルタ一覧
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
 * XMLからフィルタをインポート
 * @param {string} xml フィルタXML
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
 * スプレッドシートのフィルタをGmailに適用
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
 * GmailとスプレッドシートのフィルタDiffをプレビュー
 * @returns {Object} Diff結果
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
 * フィルタの差分をGmailに適用
 * @param {boolean} dryRun ドライランモード
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

/**
 * 既存メールにフィルタを適用
 * @param {Object} filter フィルタ設定
 * @returns {Object} 適用結果
 */
function applyToExistingMessages(filter) {
  try {
    return applyFilterToExistingMessages(filter)
  } catch (error) {
    console.error('Error applying filter to existing messages:', error)
    throw new Error(`Failed to apply filter to existing messages: ${error.message}`)
  }
}
