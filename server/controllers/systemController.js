/**
 * システム設定・ユーティリティController
 * ユーザー情報取得・初期セットアップ・スプレッドシートURL取得を担当
 */

/**
 * 現在ログイン中のユーザー情報を取得
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
 * データ保存用スプレッドシートのURLを取得
 * @returns {Object} スプレッドシートURL
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
 * 初回セットアップ：スプレッドシート作成
 * @returns {Object} セットアップ結果
 */
function setup() {
  const ss = getOrCreateSpreadsheet()
  console.log('Spreadsheet created/initialized: ' + ss.getUrl())
  return {
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId()
  }
}
