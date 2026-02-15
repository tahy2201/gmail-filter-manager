/**
 * Gmail Label Service
 * ラベルの取得と管理を担当
 */

/**
 * Gmail APIのラベルオブジェクトをクライアント向けの形式に変換
 */
function toLabelResponse(label) {
  return {
    id: label.id,
    name: label.name,
    type: label.type === 'system' ? 'system' : 'user',
    color: label.color
      ? { backgroundColor: label.color.backgroundColor, textColor: label.color.textColor }
      : null
  }
}

/**
 * Gmail ラベル一覧を取得（カラー情報付き）
 * @returns {Array} ラベル一覧
 */
function listGmailLabels() {
  const response = Gmail.Users.Labels.list('me')
  const labels = response.labels || []

  return labels.map(toLabelResponse).sort((a, b) => {
    if (a.type !== b.type) return a.type === 'user' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}

/**
 * ラベルを取得または作成
 * @param {string} labelName - ラベル名
 * @returns {Object} Gmail ラベル
 */
function getOrCreateLabel(labelName) {
  const labels = Gmail.Users.Labels.list('me').labels || []
  const existing = labels.find((l) => l.name === labelName)

  if (existing) {
    return existing
  }

  // ラベルを作成
  return Gmail.Users.Labels.create(
    {
      name: labelName,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show'
    },
    'me'
  )
}

/**
 * Gmail にラベルを作成（重複チェック付き）
 * @param {string} labelName - ラベル名
 * @returns {Object} 作成されたラベル
 */
function createLabelInGmail(labelName) {
  const labels = Gmail.Users.Labels.list('me').labels || []
  const existing = labels.find((l) => l.name === labelName)

  if (existing) {
    throw new Error('同名のラベルが既に存在します: ' + labelName)
  }

  const created = Gmail.Users.Labels.create(
    {
      name: labelName,
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show'
    },
    'me'
  )

  addHistory('CREATE_LABEL', labelName, 'Created label ' + created.id)

  return toLabelResponse(created)
}

/**
 * Gmail のラベルをリネーム（サブラベルのカスケードリネーム付き）
 * @param {string} labelId - ラベルID
 * @param {string} newName - 新しいラベル名
 * @returns {Object} 更新されたラベル
 */
function renameLabelInGmail(labelId, newName) {
  // 重複チェック
  const labels = Gmail.Users.Labels.list('me').labels || []
  const existing = labels.find((l) => l.name === newName && l.id !== labelId)
  if (existing) {
    throw new Error('同名のラベルが既に存在します: ' + newName)
  }

  // リネーム前の名前を取得
  const currentLabel = labels.find((l) => l.id === labelId)
  if (!currentLabel) {
    throw new Error('ラベルが見つかりません: ' + labelId)
  }
  const oldName = currentLabel.name

  // 親ラベルをリネーム
  const updated = Gmail.Users.Labels.update({ name: newName }, 'me', labelId)

  // 削除ルールのlabelNameを同期
  updateDeleteRuleLabelName(labelId, newName)

  // サブラベルのカスケードリネーム
  const oldPrefix = oldName + '/'
  const newPrefix = newName + '/'
  const childLabels = labels.filter((l) => l.name.startsWith(oldPrefix))

  for (const child of childLabels) {
    const newChildName = newPrefix + child.name.substring(oldPrefix.length)
    Gmail.Users.Labels.update({ name: newChildName }, 'me', child.id)
    updateDeleteRuleLabelName(child.id, newChildName)
  }

  addHistory(
    'RENAME_LABEL',
    newName,
    'Renamed label ' +
      labelId +
      (childLabels.length > 0 ? ' (+ ' + childLabels.length + ' sub-labels)' : '')
  )

  return toLabelResponse(updated)
}

/**
 * Gmail からラベルを削除（サブラベルのカスケード削除付き）
 * @param {string} labelId - ラベルID
 * @returns {Object} 削除結果
 */
function deleteLabelFromGmail(labelId) {
  // ラベル名を取得（履歴用）
  const label = Gmail.Users.Labels.get('me', labelId)
  const labelName = label.name

  // サブラベルを検出（深いものから削除するためソート）
  const allLabels = Gmail.Users.Labels.list('me').labels || []
  const childPrefix = labelName + '/'
  const childLabels = allLabels
    .filter((l) => l.name.startsWith(childPrefix))
    .sort((a, b) => b.name.length - a.name.length) // 深いものから

  // サブラベルを順次削除
  for (const child of childLabels) {
    removeDeleteRulesByLabelId(child.id)
    Gmail.Users.Labels.remove('me', child.id)
  }

  // 親ラベルの関連する削除ルールを除去
  removeDeleteRulesByLabelId(labelId)

  Gmail.Users.Labels.remove('me', labelId)

  addHistory(
    'DELETE_LABEL',
    labelName,
    'Deleted label ' +
      labelId +
      (childLabels.length > 0 ? ' (+ ' + childLabels.length + ' sub-labels)' : '')
  )

  return { success: true }
}

/**
 * ラベル削除の影響をチェック（サブラベル情報付き）
 * @param {string} labelId - ラベルID
 * @returns {Object} 影響情報 { filtersCount, deleteRulesCount, childLabelsCount }
 */
function getLabelDeletionImpact(labelId) {
  // ラベル名を取得
  const label = Gmail.Users.Labels.get('me', labelId)
  const labelName = label.name

  // サブラベルを検出
  const allLabels = Gmail.Users.Labels.list('me').labels || []
  const childPrefix = labelName + '/'
  const childLabels = allLabels.filter((l) => l.name.startsWith(childPrefix))
  const targetLabelIds = [labelId, ...childLabels.map((l) => l.id)]

  // フィルタへの影響（親+子ラベル合算）
  const gmailFilters = Gmail.Users.Settings.Filters.list('me').filter || []
  const filtersCount = gmailFilters.filter((f) => {
    const addLabelIds = (f.action && f.action.addLabelIds) || []
    return addLabelIds.some((id) => targetLabelIds.includes(id))
  }).length

  // 削除ルールへの影響（親+子ラベル合算）
  const deleteRules = getDeleteRulesFromStorage()
  const deleteRulesCount = deleteRules.filter((r) => targetLabelIds.includes(r.labelId)).length

  return { filtersCount, deleteRulesCount, childLabelsCount: childLabels.length }
}

/**
 * ラベルのカラーを更新
 * @param {string} labelId - ラベルID
 * @param {string} backgroundColor - 背景色（hex）
 * @param {string} textColor - テキスト色（hex）
 * @returns {Object} 更新されたラベル
 */
function updateLabelColorInGmail(labelId, backgroundColor, textColor) {
  const color = backgroundColor && textColor ? { backgroundColor, textColor } : null

  const updated = Gmail.Users.Labels.update({ color }, 'me', labelId)

  addHistory('UPDATE_LABEL_COLOR', updated.name, 'Updated color for label ' + labelId)

  return toLabelResponse(updated)
}
