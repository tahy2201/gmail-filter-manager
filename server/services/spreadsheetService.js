const SPREADSHEET_ID_KEY = 'SPREADSHEET_ID'
const DELETE_RULES_SHEET_NAME = 'DeleteRules'
const HISTORY_SHEET_NAME = 'History'

function getOrCreateSpreadsheet() {
  const props = PropertiesService.getUserProperties()
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

function initializeSheets(ss) {
  // デフォルトの Sheet1 を DeleteRules にリネーム
  let deleteSheet = ss.getSheetByName(DELETE_RULES_SHEET_NAME)
  if (!deleteSheet) {
    deleteSheet = ss.getSheets()[0]
    deleteSheet.setName(DELETE_RULES_SHEET_NAME)
  }
  deleteSheet.getRange('A1:D1').setValues([['labelId', 'labelName', 'delayDays', 'enabled']])
  deleteSheet.getRange('A1:D1').setFontWeight('bold')

  // History シート
  let historySheet = ss.getSheetByName(HISTORY_SHEET_NAME)
  if (!historySheet) {
    historySheet = ss.insertSheet(HISTORY_SHEET_NAME)
  }
  historySheet.getRange('A1:D1').setValues([['timestamp', 'action', 'target', 'details']])
  historySheet.getRange('A1:D1').setFontWeight('bold')
}

function getSheet(sheetName) {
  const ss = getOrCreateSpreadsheet()
  let sheet = ss.getSheetByName(sheetName)

  if (!sheet) {
    initializeSheets(ss)
    sheet = ss.getSheetByName(sheetName)
  }

  return sheet
}

function addHistory(action, target, details) {
  const sheet = getSheet(HISTORY_SHEET_NAME)
  const timestamp = new Date().toISOString()
  sheet.appendRow([timestamp, action, target, details])
}

function getHistory(limit) {
  const maxRows = limit || 50
  const sheet = getSheet(HISTORY_SHEET_NAME)
  const lastRow = sheet.getLastRow()

  if (lastRow <= 1) return []

  const dataRowCount = lastRow - 1
  const rowsToFetch = Math.min(dataRowCount, maxRows)
  const startRow = lastRow - rowsToFetch + 1

  const data = sheet.getRange(startRow, 1, rowsToFetch, 4).getValues()
  return rowsToHistory(data)
}

function getSpreadsheetUrl() {
  return getOrCreateSpreadsheet().getUrl()
}

function updateSpreadsheetId(newSpreadsheetId) {
  // 新しいIDでスプレッドシートを開けるか検証（開けなければ例外がthrowされる）
  const ss = SpreadsheetApp.openById(newSpreadsheetId)

  // 必須シートの存在確認
  const requiredSheets = [DELETE_RULES_SHEET_NAME, HISTORY_SHEET_NAME]
  const missingSheets = requiredSheets.filter(function (name) {
    return !ss.getSheetByName(name)
  })
  if (missingSheets.length > 0) {
    throw new Error('必須シートが見つかりません: ' + missingSheets.join(', '))
  }

  // 成功したらUserPropertiesを更新
  PropertiesService.getUserProperties().setProperty(SPREADSHEET_ID_KEY, newSpreadsheetId)
  return ss
}
