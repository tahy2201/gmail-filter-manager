/**
 * Migration Script
 * 旧仕様 → 新仕様へのデータ移行（GASエディタから手動実行）
 */

/**
 * DeleteRules シートを旧3列形式 → 新4列形式に移行
 *
 * 旧形式: [labelName, delayDays, enabled]
 * 新形式: [labelId, labelName, delayDays, enabled]
 *
 * GASエディタから `migrateDeleteRules()` を実行してください。
 */
function migrateDeleteRules() {
  const sheet = getSheet('DeleteRules')
  const header = sheet.getRange('A1').getValue()

  // 既に移行済みかチェック
  if (header === 'labelId') {
    console.log('既に新形式です。移行不要です。')
    return { migrated: 0, message: '既に新形式です' }
  }

  // 旧形式のヘッダーを確認
  if (header !== 'labelName') {
    throw new Error('想定外のヘッダー: ' + header + '（旧形式 "labelName" を期待）')
  }

  const lastRow = sheet.getLastRow()
  if (lastRow <= 1) {
    // データなし、ヘッダーだけ更新
    sheet.getRange('A1:D1').setValues([['labelId', 'labelName', 'delayDays', 'enabled']])
    sheet.getRange('A1:D1').setFontWeight('bold')
    console.log('データなし。ヘッダーのみ更新しました。')
    return { migrated: 0, message: 'ヘッダーのみ更新' }
  }

  // 旧データを読み込み (3列: labelName, delayDays, enabled)
  const oldData = sheet.getRange(2, 1, lastRow - 1, 3).getValues()

  // ラベル名 → ID のマップを構築
  const { nameToId } = buildLabelMap()

  // 新形式に変換
  const newData = []
  const warnings = []

  for (var i = 0; i < oldData.length; i++) {
    var row = oldData[i]
    var labelName = row[0]
    var delayDays = row[1]
    var enabled = row[2]

    if (!labelName) continue

    var labelId = nameToId[labelName]
    if (!labelId) {
      warnings.push('ラベル "' + labelName + '" が見つかりません（スキップ）')
      continue
    }

    newData.push([labelId, labelName, delayDays, enabled])
  }

  // シートをクリアして書き直し
  sheet.getRange(1, 1, lastRow, 4).clearContent()

  // 新ヘッダー
  sheet.getRange('A1:D1').setValues([['labelId', 'labelName', 'delayDays', 'enabled']])
  sheet.getRange('A1:D1').setFontWeight('bold')

  // 新データ
  if (newData.length > 0) {
    sheet.getRange(2, 1, newData.length, 4).setValues(newData)
  }

  // 結果をログ出力
  console.log('移行完了: ' + newData.length + ' 件')
  if (warnings.length > 0) {
    console.log('警告:')
    for (var j = 0; j < warnings.length; j++) {
      console.log('  - ' + warnings[j])
    }
  }

  addHistory('MIGRATE', 'DeleteRules', '3列→4列移行: ' + newData.length + '件 (警告: ' + warnings.length + '件)')

  return {
    migrated: newData.length,
    warnings: warnings
  }
}
