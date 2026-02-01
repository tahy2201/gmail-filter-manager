const SPREADSHEET_ID_KEY = 'SPREADSHEET_ID'
const FILTERS_SHEET_NAME = 'Filters'
const DELETE_RULES_SHEET_NAME = 'DeleteRules'
const HISTORY_SHEET_NAME = 'History'

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
  const history = []

  for (let i = data.length - 1; i >= 0; i--) {
    const row = data[i]
    if (!row[0]) continue
    history.push({
      timestamp: row[0],
      action: row[1] || '',
      target: row[2] || '',
      details: row[3] || ''
    })
  }

  return history
}

function getSpreadsheetUrl() {
  return getOrCreateSpreadsheet().getUrl()
}

function setSpreadsheetId(spreadsheetId) {
  PropertiesService.getScriptProperties().setProperty(SPREADSHEET_ID_KEY, spreadsheetId)
  initializeSheets(SpreadsheetApp.openById(spreadsheetId))
}
