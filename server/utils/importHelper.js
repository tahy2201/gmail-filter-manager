/**
 * Import Helper - 補助スクリプト
 * XMLインポートやデータ移行用の関数
 */

/**
 * XMLからフィルタをインポート
 * GASエディタからこの関数を実行してください
 *
 * 使い方:
 * 1. Gmailの設定 > フィルタとブロック中のアドレス > すべてのフィルタをエクスポート
 * 2. ダウンロードしたXMLの内容を下のxml変数に貼り付け
 * 3. この関数を実行
 */
function importMyFilters() {
  const xml = `<!-- ここにGmailからエクスポートしたXMLを貼り付けてください -->`

  if (xml.includes('ここにGmail')) {
    throw new Error('XMLを貼り付けてから実行してください')
  }

  const result = importFiltersFromXml(xml)
  console.log('Import result:', JSON.stringify(result))
  return result
}

/**
 * スプレッドシートの内容を確認
 */
function checkSpreadsheetData() {
  const filters = getFiltersFromSpreadsheet()
  console.log('Filters count:', filters.length)
  console.log('First 3 filters:', JSON.stringify(filters.slice(0, 3), null, 2))

  const deleteRules = getDeleteRulesFromStorage()
  console.log('Delete rules count:', deleteRules.length)

  return {
    filtersCount: filters.length,
    deleteRulesCount: deleteRules.length
  }
}
