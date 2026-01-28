/**
 * Spreadsheet Service
 * スプレッドシートへのアクセスを管理
 */

const SPREADSHEET_ID_KEY = 'SPREADSHEET_ID'
const FILTERS_SHEET_NAME = 'Filters'
const DELETE_RULES_SHEET_NAME = 'DeleteRules'
const HISTORY_SHEET_NAME = 'History'

/**
 * スプレッドシートを取得（なければ作成）
 * @returns {Spreadsheet} スプレッドシート
 */
function getOrCreateSpreadsheet() {
  const props = PropertiesService.getScriptProperties()
  let spreadsheetId = props.getProperty(SPREADSHEET_ID_KEY)

  if (spreadsheetId) {
    try {
      return SpreadsheetApp.openById(spreadsheetId)
    } catch (e) {
      console.log('Spreadsheet not found, creating new one')
    }
  }

  // 新規作成
  const ss = SpreadsheetApp.create('Gmail Filter Manager Data')
  spreadsheetId = ss.getId()
  props.setProperty(SPREADSHEET_ID_KEY, spreadsheetId)

  // シートを初期化
  initializeSheets(ss)

  console.log('Created new spreadsheet: ' + spreadsheetId)
  return ss
}

/**
 * シートを初期化
 * @param {Spreadsheet} ss - スプレッドシート
 */
function initializeSheets(ss) {
  // Filters シート
  let filtersSheet = ss.getSheetByName(FILTERS_SHEET_NAME)
  if (!filtersSheet) {
    filtersSheet = ss.getSheets()[0]
    filtersSheet.setName(FILTERS_SHEET_NAME)
  }
  filtersSheet
    .getRange('A1:J1')
    .setValues([
      [
        'id',
        'from',
        'to',
        'subject',
        'hasTheWord',
        'doesNotHaveTheWord',
        'label',
        'shouldArchive',
        'shouldMarkAsRead',
        'shouldNeverSpam'
      ]
    ])
  filtersSheet.getRange('A1:J1').setFontWeight('bold')

  // DeleteRules シート
  let deleteSheet = ss.getSheetByName(DELETE_RULES_SHEET_NAME)
  if (!deleteSheet) {
    deleteSheet = ss.insertSheet(DELETE_RULES_SHEET_NAME)
  }
  deleteSheet.getRange('A1:C1').setValues([['labelName', 'delayDays', 'enabled']])
  deleteSheet.getRange('A1:C1').setFontWeight('bold')

  // History シート
  let historySheet = ss.getSheetByName(HISTORY_SHEET_NAME)
  if (!historySheet) {
    historySheet = ss.insertSheet(HISTORY_SHEET_NAME)
  }
  historySheet.getRange('A1:D1').setValues([['timestamp', 'action', 'target', 'details']])
  historySheet.getRange('A1:D1').setFontWeight('bold')
}

/**
 * 指定シートを取得
 * @param {string} sheetName - シート名
 * @returns {Sheet} シート
 */
function getSheet(sheetName) {
  const ss = getOrCreateSpreadsheet()
  let sheet = ss.getSheetByName(sheetName)

  if (!sheet) {
    initializeSheets(ss)
    sheet = ss.getSheetByName(sheetName)
  }

  return sheet
}

/**
 * 履歴を追加
 * @param {string} action - アクション名
 * @param {string} target - 対象
 * @param {string} details - 詳細
 */
function addHistory(action, target, details) {
  const sheet = getSheet(HISTORY_SHEET_NAME)
  const timestamp = new Date().toISOString()
  sheet.appendRow([timestamp, action, target, details])
}

/**
 * スプレッドシートのURLを取得
 * @returns {string} URL
 */
function getSpreadsheetUrl() {
  const ss = getOrCreateSpreadsheet()
  return ss.getUrl()
}

/**
 * スプレッドシートIDを設定（既存シートを使う場合）
 * @param {string} spreadsheetId - スプレッドシートID
 */
function setSpreadsheetId(spreadsheetId) {
  const props = PropertiesService.getScriptProperties()
  props.setProperty(SPREADSHEET_ID_KEY, spreadsheetId)

  // シートを初期化
  const ss = SpreadsheetApp.openById(spreadsheetId)
  initializeSheets(ss)
}
